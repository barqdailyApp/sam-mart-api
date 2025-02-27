import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { MakeRestaurantOrderTransaction } from './util/make-restaureant-order.transaction';
import { MakeRestaurantOrderRequest } from './dto/request/make-restaurant-order.request';
import { InjectRepository } from '@nestjs/typeorm';
import { RestaurantOrder } from 'src/infrastructure/entities/restaurant/order/restaurant_order.entity';
import { In, Repository } from 'typeorm';
import { ShipmentStatusEnum } from 'src/infrastructure/data/enums/shipment_status.enum';
import { Driver } from 'src/infrastructure/entities/driver/driver.entity';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { DriverTypeEnum } from 'src/infrastructure/data/enums/driver-type.eum';
import { PaginatedRequest } from 'src/core/base/requests/paginated.request';
import { GetDriverRestaurantOrdersQuery } from './dto/query/get-driver-restaurant-order.query';
import { OrderGateway } from 'src/integration/gateways/order.gateway';
import { NotificationService } from '../notification/notification.service';
import { NotificationTypes } from 'src/infrastructure/data/enums/notification-types.enum';
import { NotificationEntity } from 'src/infrastructure/entities/notification/notification.entity';
import { BaseService } from 'src/core/base/service/service.base';
import { I18nResponse } from 'src/core/helpers/i18n.helper';
import { operationType } from 'src/infrastructure/data/enums/operation-type.enum';
import { PaymentMethodEnum } from 'src/infrastructure/data/enums/payment-method';
import { ReasonType } from 'src/infrastructure/data/enums/reason-type.enum';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { TransactionTypes } from 'src/infrastructure/data/enums/transaction-types';
import { CancelShipmentRequest } from '../order/dto/request/cancel-shipment.request';
import { MakeTransactionRequest } from '../transaction/dto/requests/make-transaction-request';
import { ReasonService } from '../reason/reason.service';
import { TransactionService } from '../transaction/transaction.service';
import { plainToInstance } from 'class-transformer';
import { FileService } from '../file/file.service';
import { AddShipmentChatMessageRequest } from '../order/dto/request/add-shipment-chat-message.request';
import { GetCommentQueryRequest } from '../support-ticket/dto/request/get-comment-query.request';
import { UserResponse } from '../user/dto/responses/user.response';
import { ShipmentChatAttachment } from 'src/infrastructure/entities/order/shipment-chat-attachment.entity';
import { ShipmentChat } from 'src/infrastructure/entities/order/shipment-chat.entity';
import { AddDriverShipmentOption } from 'src/infrastructure/data/enums/add-driver-shipment-option.enum';
import { ShipmentChatGateway } from 'src/integration/gateways/shipment-chat-gateway';
@Injectable()
export class RestaurantOrderService extends BaseService<RestaurantOrder> {
  constructor(
    @InjectRepository(RestaurantOrder)
    private readonly restaurantOrderRepository: Repository<RestaurantOrder>,
    private readonly makeRestaurantOrderTransaction: MakeRestaurantOrderTransaction,
    private readonly shipmentChatGateway: ShipmentChatGateway,
    @InjectRepository(Driver)
    private readonly driverRepository: Repository<Driver>,
    @Inject(REQUEST) private readonly _request: Request,
    private readonly orderGateway: OrderGateway,
    private readonly notificationService: NotificationService,
    @Inject(TransactionService)
    private readonly transactionService: TransactionService,
    @InjectRepository(ShipmentChat)
    private shipmentChatRepository: Repository<ShipmentChat>,
    @Inject(ReasonService)
    private readonly reasonService: ReasonService,
    @Inject(FileService) private _fileService: FileService,
    @Inject(I18nResponse) private readonly _i18nResponse: I18nResponse,
    @InjectRepository(ShipmentChatAttachment)
    private shipmentChatAttachmentRepository: Repository<ShipmentChatAttachment>,
  ) {
    super(restaurantOrderRepository);
  }

  async makeRestaurantOrder(req: MakeRestaurantOrderRequest) {
    return await this.makeRestaurantOrderTransaction.run(req);
  }

  async getRestaurantOrdersDriverRequests(query: PaginatedRequest) {
    // if limit and page are null put default values
    if (!query.limit) query.limit = 10;
    if (!query.page) query.page = 1;
    const driver = await this.driverRepository.findOne({
      where: {
        user_id: this._request.user.id,
        is_receive_orders: true,
        type: DriverTypeEnum.FOOD,
      },
      order: { created_at: 'DESC' },
    });
    const orders = await this.restaurantOrderRepository.findAndCount({
      where: {
        driver_id: null,
        status: ShipmentStatusEnum.CONFIRMED,
        restaurant: {
          city_id: driver.city_id,
        },
      },
      take: query.limit * 1,
      withDeleted: true,
      skip: query.page - 1,
      relations: {
        user: true,
        restaurant: true,
        address: true,
        payment_method: true,
      },
    });

    return { orders: orders[0], total: orders[1] };
  }

  async driverAcceptOrder(id: string) {
    const driver = await this.driverRepository.findOne({
      where: {
        user_id: this._request.user.id,
        is_receive_orders: true,
        type: DriverTypeEnum.FOOD,
      },
    });
    const order = await this.restaurantOrderRepository.findOne({
      where: { id, driver_id: null },
      withDeleted: true,
      relations: { user: true, restaurant: true, address: true },
    });
    if (!order) throw new Error('message.order_not_found');
    order.driver_id = driver.id;
    if (order.status != ShipmentStatusEnum.CONFIRMED)
      throw new Error('message.order_is_not_confirmed');

    //send notification to driver and emit event
    const drivers = await this.driverRepository.find({
      where: {
        user_id: this._request.user.id,
        is_receive_orders: true,
        type: DriverTypeEnum.FOOD,
      },
      relations: { user: true },
    });
    try {
      await this.orderGateway.emitRestauarntOrderEvent(
        { ...order, driver: driver },
        drivers.map((driver) => driver.id),
      );
    } catch (e) {}

    order.status = ShipmentStatusEnum.ACCEPTED;
    await this.restaurantOrderRepository.save(order);

    const intialShipmentMessage = 'order has been accepted by driver';

    const intialShipmentChat = this.shipmentChatRepository.create({
      message: `${intialShipmentMessage} ${driver.user.name}`,
      user_id: this._request.user.id,
      restaurant_order_id: order.id,
    });
    await this.driverRepository.save(driver);
    await this.shipmentChatRepository.save(intialShipmentChat);
    return order;
  }

  async getRestaurantOrdersDriverOrders(query: GetDriverRestaurantOrdersQuery) {
    // if limit and page are null put default values

    if (!query.limit) query.limit = 10;
    if (!query.page) query.page = 1;

    const driver = await this.driverRepository.findOne({
      where: {
        user_id: this._request.user.id,
        is_receive_orders: true,
        type: DriverTypeEnum.FOOD,
      },
      order: { created_at: 'DESC' },
    });

    const orders = await this.restaurantOrderRepository.findAndCount({
      where: {
        driver_id: driver.id,
        status:
          query?.status == ShipmentStatusEnum.ACTIVE
            ? In([
                ShipmentStatusEnum.ACCEPTED,
                ShipmentStatusEnum.READY_FOR_PICKUP,
                ShipmentStatusEnum.PICKED_UP,
                ShipmentStatusEnum.PROCESSING,
              ])
            : query.status,
      },
      take: query.limit * 1,
      skip: query.page - 1,
      withDeleted: true,
      relations: { user: true, restaurant: true, address: true },
    });
    return { orders: orders[0], total: orders[1] };
  }
  async getRestaurantOrdersClientOrders(query: GetDriverRestaurantOrdersQuery) {
    // if limit and page are null put default values

    if (!query.limit) query.limit = 10;
    if (!query.page) query.page = 1;

 

    const orders = await this.restaurantOrderRepository.findAndCount({
      where: {
        user_id: this._request.user.id,
      
      },
      take: query.limit * 1,
      skip: query.page - 1,
      withDeleted: true,
      relations: { user: true, restaurant: true, address: true,driver:{user:true},cancelShipmentReason:true},
      order: { created_at: 'DESC' },
    });
    return { orders: orders[0], total: orders[1] };
  }
  async getTotalDriverOrders() {
    const user = this._request.user;
    const driver = await this.driverRepository.findOne({
      where: {
        user_id: user.id,
      },
    });
    const ordersNew = await this.restaurantOrderRepository.count({
      where: {
        status: ShipmentStatusEnum.CONFIRMED,

        restaurant: { city_id: driver.city_id },
      },
    });
    const ordersActive = await this.restaurantOrderRepository.count({
      where: {
        status: In([
          ShipmentStatusEnum.ACCEPTED,
          ShipmentStatusEnum.PROCESSING,
          ShipmentStatusEnum.PICKED_UP,
          ShipmentStatusEnum.READY_FOR_PICKUP,
        ]),
        driver_id: driver.id,
      },
    });

    const ordersDelivered = await this.restaurantOrderRepository.count({
      where: {
        status: ShipmentStatusEnum.DELIVERED,
        driver_id: driver.id,
      },
    });

    return {
      ordersNew,
      ordersActive,
      ordersDelivered,
    };
  }

  async confirmOrder(id: string) {
    const order = await this.restaurantOrderRepository.findOne({
      where: { id },
      withDeleted: true,
      relations: {
        user: true,
        restaurant: true,
        address: true,
        payment_method: true,
        driver: true,
      },
    });
    if (!order) throw new Error('message.order_not_found');
    order.status = ShipmentStatusEnum.CONFIRMED;
    order.order_confirmed_at = new Date();
    await this.restaurantOrderRepository.save(order);
    const drivers = await this.driverRepository.find({
      where: {
        city_id: order.restaurant.city_id,
        is_receive_orders: true,
        type: DriverTypeEnum.FOOD,
      },
      relations: { user: true },
    });
    const restult = this._i18nResponse.entity(order);
    try {
      await this.orderGateway.emitRestauarntOrderEvent(
        restult,
        drivers.map((driver) => driver.id),
      );
      for (let index = 0; index < drivers.length; index++) {
        if (drivers[index].user?.fcm_token != null)
          await this.notificationService.create(
            new NotificationEntity({
              user_id: drivers[index].user_id,
              url: order.id,
              type: NotificationTypes.ORDERS,
              title_ar: 'طلب جديد',
              title_en: 'new order',
              text_ar: 'هل تريد اخذ هذا الطلب ؟',
              text_en: 'Do you want to take t`his order?',
            }),
          );
      }
    } catch (e) {}
    return order;
  }

  async orderProcessing(id: string) {
    const order = await this.restaurantOrderRepository.findOne({
      where: { id },
      withDeleted: true,
      relations: {
        user: true,
        restaurant: true,
        address: true,
        payment_method: true,
        driver: { user: true },
      },
    });
    if (!order) throw new Error('message.order_not_found');
    if (order.status != ShipmentStatusEnum.ACCEPTED)
      throw new Error('message.order_is_not_confirmed');
    order.status = ShipmentStatusEnum.PROCESSING;
    order.order_on_processed_at = new Date();
    await this.restaurantOrderRepository.save(order);
    //send notification to driver and emit event
    try {
      this.orderGateway.emitRestauarntOrderEvent(order, [order.driver_id]);
      await this.notificationService.create(
        new NotificationEntity({
          user_id: order.driver.user_id,
          url: order.id,
          type: NotificationTypes.ORDERS,
          title_ar: 'جارى تحضير الطلب',
          title_en: 'Preparing order',
          text_ar: 'جارى تحضير الطلب',
          text_en: 'Preparing order',
        }),
      );
    } catch (e) {}
    return order;
  }

  async readyForPickup(id: string) {
    const order = await this.restaurantOrderRepository.findOne({
      where: { id },
      withDeleted: true,
      relations: {
        user: true,
        restaurant: true,
        address: true,
        payment_method: true,
        driver: { user: true },
      },
    });
    if (!order) throw new Error('message.order_not_found');
    if (order.status != ShipmentStatusEnum.PROCESSING)
      throw new Error('message.order_is_not_processing');
    order.order_ready_for_pickup_at = new Date();
    order.status = ShipmentStatusEnum.READY_FOR_PICKUP;
    await this.restaurantOrderRepository.save(order);
    //send notification to driver and emit event
    try {
      this.orderGateway.emitRestauarntOrderEvent(order, [order.driver_id]);
      await this.notificationService.create(
        new NotificationEntity({
          user_id: order.driver.user_id,
          url: order.id,
          type: NotificationTypes.ORDERS,
          title_ar: 'الطلب جاهز للتوصيل',
          title_en: 'Order ready for delivery',
          text_ar: 'الطلب جاهز للتوصيل',
          text_en: 'Order ready for delivery',
        }),
      );
    } catch (e) {}

    return order;
  }

  async pickupOrder(id: string) {
    const order = await this.restaurantOrderRepository.findOne({
      where: { id },
      withDeleted: true,
      relations: {
        user: true,
        restaurant: true,
        address: true,
        payment_method: true,
        driver: { user: true },
      },
    });
    if (!order) throw new Error('message.order_not_found');
    if (order.status != ShipmentStatusEnum.READY_FOR_PICKUP)
      throw new Error('message.order_is_not_ready_for_pickup');
    order.status = ShipmentStatusEnum.PICKED_UP;
    order.order_shipped_at = new Date();
    await this.restaurantOrderRepository.save(order);
    //send notification to driver and emit event
    try {
      this.orderGateway.emitRestauarntOrderEvent(order, [order.user_id]);
      await this.notificationService.create(
        new NotificationEntity({
          user_id: order.user_id,
          url: order.id,
          type: NotificationTypes.ORDERS,
          title_ar: 'الطلب قيد التوصيل',
          title_en: 'Order in delivery',
          text_ar: 'الطلب قيد التوصيل',
          text_en: 'Order in delivery',
        }),
      );
    } catch (e) {}
    return order;
  }

  async deliverOrder(id: string) {
    const order = await this.restaurantOrderRepository.findOne({
      where: { id },
      withDeleted: true,
      relations: {
        user: true,
        restaurant: true,
        address: true,
        payment_method: true,
        driver: { user: true },
      },
    });
    if (!order) throw new Error('message.order_not_found');
    if (order.status != ShipmentStatusEnum.PICKED_UP)
      throw new Error('message.order_is_not_picked_up');
    order.order_delivered_at = new Date();
    order.status = ShipmentStatusEnum.DELIVERED;
    await this.restaurantOrderRepository.save(order);
    //send notification to driver and emit event
    try {
      this.orderGateway.emitRestauarntOrderEvent(order, [order.user_id]);
      await this.notificationService.create(
        new NotificationEntity({
          user_id: order.user_id,
          url: order.id,
          type: NotificationTypes.ORDERS,
          title_ar: 'الطلب تم التوصيل',
          title_en: 'Order delivered',
          text_ar: 'الطلب تم التوصيل',
          text_en: 'Order delivered',
        }),
      );
    } catch (e) {
      console.log(e);
    }
    return order;
  }

  async getRestaurantOrderDetails(id: string) {
    const order = await this.restaurantOrderRepository.findOne({
      where: { id },
      withDeleted: true,
      relations: {
        user: true,
        payment_method: true,
        driver:{user:true},
        restaurant: true,
        address: true,
        restaurant_order_meals: {
          meal: true,
          restaurant_order_meal_options: { option: { option_group: true } },
        },
      },
    });
    if (!order) throw new Error('message.order_not_found');
    return order;
  }

  async assignDriverToOrder(id: string, driver_id: string) {
    const order = await this.restaurantOrderRepository.findOne({
      where: { id },
      withDeleted: true,
      relations: {
        user: true,
        payment_method: true,
        restaurant: true,
        address: true,
        driver: true,
      },
    });
    if (!order) throw new Error('message.order_not_found');
    const driver = await this.driverRepository.findOne({
      where: {
        id: driver_id,
        city_id: order.restaurant.city_id,
        is_receive_orders: true,
        type: DriverTypeEnum.FOOD,
      },
      relations: { user: true },
    });
    if (!driver) throw new Error('message.driver_not_found');
    order.driver_id = driver_id;
    order.status = ShipmentStatusEnum.ACCEPTED;
    await this.restaurantOrderRepository.save(order);
    return order;
  }
  async getDriver(driver_id: string) {
    const driver = await this.driverRepository.findOne({
      where: { user_id: driver_id },
      relations: { user: true },
    });
    // if(!driver) throw new Error('message.driver_not_found')
    return driver;
  }

  async cancelOrder(order_id: string, req: CancelShipmentRequest) {
    const { reason_id } = req;

    const order = await this.restaurantOrderRepository.findOne({
      where: { id: order_id },
      relations: {
        user: true,
        payment_method: true,
        restaurant: true,
        address: true,
        driver: { user: true },
      },
    });

    if (!order) {
      throw new NotFoundException('message.order_not_found');
    }

    const currentUserRole = this._request.user.roles;
    const orderStatus = order.status;
    const driver = order.driver
      ? await this.getDriver(
          currentUserRole.includes(Role.DRIVER)
            ? this._request.user.id
            : order.driver.user_id,
        )
      : null;

    if (
      (currentUserRole.includes(Role.CLIENT) &&
        order.user_id !== this._request.user.id) ||
      (currentUserRole.includes(Role.DRIVER) &&
        order.driver_id !== driver.id &&
        !currentUserRole.includes(Role.ADMIN) &&
        !currentUserRole.includes(Role.EMPLOYEE))
    ) {
      throw new UnauthorizedException('message.not_allowed_to_cancel');
    }

    if (
      (currentUserRole.includes(Role.CLIENT) &&
        orderStatus === ShipmentStatusEnum.PICKED_UP) ||
      (currentUserRole.includes(Role.DRIVER) &&
        orderStatus === ShipmentStatusEnum.PENDING) ||
      orderStatus ===
        (ShipmentStatusEnum.CANCELED ||
          ShipmentStatusEnum.DELIVERED ||
          ShipmentStatusEnum.RETRUNED ||
          ShipmentStatusEnum.COMPLETED)
    ) {
      throw new BadRequestException('message.not_allowed_to_cancel_shipment');
    }

    const reason = await this.reasonService.findOne({
      id: reason_id,
      type: ReasonType.CANCEL_ORDER,
    });

    // if (
    //   !reason ||
    //   !reason.roles.some((role) => currentUserRole.includes(role))
    // ) {
    //   throw new BadRequestException('message.reason_not_found');
    // }

    if (!reason) {
      throw new BadRequestException('message.reason_not_found');
    }

    let to_rooms = ['admin', order.user_id];
    if (order.status === ShipmentStatusEnum.PENDING) {
    } else {
      to_rooms.push(order.driver_id);
    }

    order.status = ShipmentStatusEnum.CANCELED;
    order.order_canceled_at = new Date();
    order.canceled_by = currentUserRole[0];
    order.cancelShipmentReason = reason;
    if (order.driver) {
      driver.current_orders = driver.current_orders - 1;
      await this.driverRepository.save(driver);
    }

    await this.restaurantOrderRepository.save(order);

    await this.orderGateway.emitRestauarntOrderEvent(order, to_rooms);
    if (order.payment_method_enum != PaymentMethodEnum.CASH) {
      await this.transactionService.makeTransaction(
        new MakeTransactionRequest({
          amount: order.total_price,
          type: TransactionTypes.ORDER_RETURN,
          order_id: order.id,
          user_id: order.user_id,
        }),
      );
    }

    if (order.driver) {
      await this.notificationService.create(
        new NotificationEntity({
          user_id: order.driver.user_id,
          url: order.id,
          type: NotificationTypes.ORDERS,
          title_ar: 'تحديث الطلب',
          title_en: 'order updated',
          text_ar: 'تم الغاء الطلب',
          text_en: 'the request has been canceled',
        }),
      );
    }
  }
  async addChatMessage(order_id: string, req: AddShipmentChatMessageRequest) {
    const order = await this._repo.findOne({
      where: { id: order_id },
      relations: { driver: { user: true } },
    });

    if (!order) throw new NotFoundException('message.order_not_found');

    if (
      order.driver.user_id !== this._request.user.id &&
      order.user_id !== this._request.user.id &&
      !this._request.user.roles.includes(Role.ADMIN) &&
      !this._request.user.roles.includes(Role.EMPLOYEE)
    ) {
      throw new UnauthorizedException('message.not_allowed_to_add_chat');
    }

    let attachedFile = null;
    if (req.file) {
      const tempImage = await this._fileService.upload(
        req.file,
        `shipment-chat`,
      );

      const createAttachedFile = this.shipmentChatAttachmentRepository.create({
        file_url: tempImage,
        file_name: req.file.originalname,
        file_type: req.file.mimetype,
      });
      attachedFile = await this.shipmentChatAttachmentRepository.save(
        createAttachedFile,
      );
    }

    const newMessage = this.shipmentChatRepository.create({
      message: req.message,
      user_id: this._request.user.id,
      restaurant_order_id: order.id,
      attachment: attachedFile,
    });
    const savedMessage = await this.shipmentChatRepository.save(newMessage);

    const userInfo = plainToInstance(UserResponse, this._request.user, {
      excludeExtraneousValues: true,
    });

    this.shipmentChatGateway.handleRestaurantSendMessage({
      order,
      shipmentChat: savedMessage,
      user: userInfo,
      action: 'ADD_MESSAGE',
    });
    // if driver send message , send notification to client
    if (order.driver.user_id === newMessage.user_id) {
      await this.notificationService.create(
        new NotificationEntity({
          user_id: order.user_id,
          url: newMessage.id,
          type: NotificationTypes.SHIPMENT_CHAT,
          title_ar: 'رسالة جديدة',
          title_en: 'new chat message',
          text_ar: newMessage.message,
          text_en: newMessage.message,
        }),
      );
    } else {
      await this.notificationService.create(
        new NotificationEntity({
          user_id: order.driver.user_id,
          url: newMessage.id,
          type: NotificationTypes.SHIPMENT_CHAT,
          title_ar: 'رسالة جديدة',
          title_en: 'new chat message',
          text_ar: newMessage.message,
          text_en: newMessage.message,
        }),
      );
    }

    return savedMessage;
  }

  async getMessagesByShipmentId(
    order_id: string,
    query: GetCommentQueryRequest,
  ) {
    const { limit = 10, offset = 0 } = query;

    const order = await this._repo.findOne({
      where: { id: order_id },
      relations: ['driver'],
    });
    if (!order) throw new NotFoundException('message.shipment_not_found');

    if (
      order.driver.user_id !== this._request.user.id &&
      order.user_id !== this._request.user.id &&
      !this._request.user.roles.includes(Role.ADMIN) &&
      !this._request.user.roles.includes(Role.EMPLOYEE)
    ) {
      throw new UnauthorizedException('message_not_allowed_to_view_chat');
    }

    return await this.shipmentChatRepository.find({
      where: { restaurant_order_id: order.id },
      relations: ['user', 'attachment'],
      order: { created_at: 'DESC' },
      skip: offset,
      take: limit,
    });
  }
}
