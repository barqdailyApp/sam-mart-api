import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { BaseUserService } from 'src/core/base/service/user-service.base';
import { Order } from 'src/infrastructure/entities/order/order.entity';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { Shipment } from 'src/infrastructure/entities/order/shipment.entity';
import { BaseService } from 'src/core/base/service/service.base';
import { Driver } from 'src/infrastructure/entities/driver/driver.entity';
import { ShipmentStatusEnum } from 'src/infrastructure/data/enums/shipment_status.enum';
import { ShipmentChat } from 'src/infrastructure/entities/order/shipment-chat.entity';
import { AddShipmentChatMessageRequest } from './dto/request/add-shipment-chat-message.request';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { FileService } from '../file/file.service';
import { ShipmentChatAttachment } from 'src/infrastructure/entities/order/shipment-chat-attachment.entity';
import { GetCommentQueryRequest } from '../support-ticket/dto/request/get-comment-query.request';
import { ShipmentChatGateway } from 'src/integration/gateways/shipment-chat-gateway';
import { plainToInstance } from 'class-transformer';
import { UserResponse } from '../user/dto/responses/user.response';
import { ShipmentFeedback } from 'src/infrastructure/entities/order/shipment-feedback.entity';
import { AddShipmentFeedBackRequest } from './dto/request/add-shipment-feedback.request';
import { DeliveryType } from 'src/infrastructure/data/enums/delivery-type.enum';
import { AddDriverShipmentOption } from 'src/infrastructure/data/enums/add-driver-shipment-option.enum';
import { SendOfferToDriver } from 'src/integration/gateways/interfaces/fast-delivery/send-offer-payload.response';
import { CancelShipmentRequest } from './dto/request/cancel-shipment.request';
import { OrderGateway } from 'src/integration/gateways/order.gateway';
import { Constant } from 'src/infrastructure/entities/constant/constant.entity';
import { ConstantType } from 'src/infrastructure/data/enums/constant-type.enum';
import { NotificationService } from '../notification/notification.service';
import { NotificationEntity } from 'src/infrastructure/entities/notification/notification.entity';
import { NotificationTypes } from 'src/infrastructure/data/enums/notification-types.enum';
import { ReasonService } from '../reason/reason.service';
import { ReasonType } from 'src/infrastructure/data/enums/reason-type.enum';
import { TransactionService } from '../transaction/transaction.service';
import { MakeTransactionRequest } from '../transaction/dto/requests/make-transaction-request';
import { TransactionTypes } from 'src/infrastructure/data/enums/transaction-types';
import { WarehouseProducts } from 'src/infrastructure/entities/warehouse/warehouse-products.entity';
import { WarehouseOperationTransaction } from '../warehouse/util/warehouse-opreation.transaction';
import { operationType } from 'src/infrastructure/data/enums/operation-type.enum';
import { ProductMeasurement } from 'src/infrastructure/entities/product/product-measurement.entity';
import { PaymentMethodEnum } from 'src/infrastructure/data/enums/payment-method';
import { ShipmentProduct } from 'src/infrastructure/entities/order/shipment-product.entity';
import { calculateSum } from 'src/core/helpers/cast.helper';
import { ProductCategoryPrice } from 'src/infrastructure/entities/product/product-category-price.entity';
import { Warehouse } from 'src/infrastructure/entities/warehouse/warehouse.entity';
import { AddProductOrderRequest } from './dto/request/add-product-order.request';
import { ShipmentProductHistory } from 'src/infrastructure/entities/order/shipment-product-history.entity';
import { ShipmentProductActionType } from 'src/infrastructure/data/enums/shipment-product-action-type.enum';
import { OrderHistory } from 'src/infrastructure/entities/order/order-history.entity';
@Injectable()
export class ShipmentService extends BaseService<Shipment> {
  constructor(
    @InjectRepository(Driver)
    private driverRepository: Repository<Driver>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Shipment)
    private shipmentRepository: Repository<Shipment>,
    @InjectRepository(ShipmentProduct)
    private shipmentProductRepository: Repository<ShipmentProduct>,
    @InjectRepository(ShipmentChat)
    private shipmentChatRepository: Repository<ShipmentChat>,
    @InjectRepository(Constant)
    private constantRepository: Repository<Constant>,
    @InjectRepository(ShipmentChatAttachment)
    private shipmentChatAttachmentRepository: Repository<ShipmentChatAttachment>,
    @InjectRepository(WarehouseProducts)
    private warehouseProductsRepository: Repository<WarehouseProducts>,
    @InjectRepository(ProductMeasurement)
    private productMeasurementRepository: Repository<ProductMeasurement>,

    private readonly shipmentChatGateway: ShipmentChatGateway,
    private readonly orderGateway: OrderGateway,

    @InjectRepository(ShipmentFeedback)
    private orderFeedBackRepository: Repository<ShipmentFeedback>,
    @Inject(REQUEST) private readonly request: Request,
    @Inject(FileService) private _fileService: FileService,
    @Inject(ReasonService)
    private readonly reasonService: ReasonService,
    @Inject(TransactionService)
    private readonly transactionService: TransactionService,

    @InjectRepository(ProductCategoryPrice)
    private productCategoryPriceRepository: Repository<ProductCategoryPrice>,

    @InjectRepository(Warehouse)
    private readonly warehouseRepository: Repository<Warehouse>,

    @InjectRepository(ShipmentProductHistory)
    private readonly shipmentProductHistoryRepository: Repository<ShipmentProductHistory>,
    @InjectRepository(OrderHistory)
    private readonly order_history_repo: Repository<OrderHistory>,

    private readonly notificationService: NotificationService,
    private readonly warehouseOperationTransaction: WarehouseOperationTransaction,
  ) {
    super(shipmentRepository);
  }

  async getDriver(driver_id?: string) {
    return await this.driverRepository.findOne({
      where: {
        user_id: driver_id ?? this.request.user.id,
      },
      relations: ['user'],
    });
  }

  async deliverShipment(id: string) {
    const driver = await this.getDriver();
    if (!driver) {
      throw new NotFoundException('message.driver_not_found');
    }
    driver.current_orders = driver.current_orders - 1;
    const shipment = await this.shipmentRepository.findOne({
      where: {
        id: id,
        warehouse_id: driver.warehouse_id,
      },
      relations: ['order', 'warehouse', 'order.user', 'driver', 'driver.user'],
    });

    if (!shipment || shipment.status !== ShipmentStatusEnum.PICKED_UP) {
      throw new NotFoundException('message.shipment_not_found');
    }

    shipment.order_delivered_at = new Date();
    shipment.status = ShipmentStatusEnum.DELIVERED;

    const order = await this.orderRepository.findOne({
      where: {
        id: shipment.order_id,
      },
      relations: ['address'],
    });
    order.is_paid = true;
    if (shipment.order.payment_method == PaymentMethodEnum.CASH) {
      await this.transactionService.makeTransaction(
        new MakeTransactionRequest({
          amount: -order.total_price,
          type: TransactionTypes.ORDER_DELIVERD,
          order_id: order.id,
          user_id: shipment.driver.user_id,
        }),
      );
    }
    await this.shipmentRepository.save(shipment);
    await this.driverRepository.save(driver);
    await this.orderRepository.save(order);

    await this.orderGateway.notifyOrderStatusChange({
      action: ShipmentStatusEnum.DELIVERED,
      to_rooms: ['admin', shipment.order.user_id],
      body: {
        shipment,
        order,
        warehouse: shipment.warehouse,
        client: shipment.order.user,
        driver,
      },
    });
    await this.notificationService.create(
      new NotificationEntity({
        user_id: order.user_id,
        url: order.id,
        type: NotificationTypes.ORDERS,
        title_ar: 'تحديث الطلب',
        title_en: 'order updated',
        text_ar: 'تم توصيل الطلب',
        text_en: 'order delivered',
      }),
    );
    return shipment;
  }
  async adminDeliverShipment(id: string) {
    const shipment = await this.shipmentRepository.findOne({
      where: {
        id: id,
      },
      relations: ['order', 'warehouse', 'order.user', 'driver', 'driver.user'],
    });

    if (!shipment || shipment.status !== ShipmentStatusEnum.READY_FOR_PICKUP) {
      throw new NotFoundException('message.shipment_not_found');
    }

    shipment.order_delivered_at = new Date();
    shipment.order_shipped_at = new Date();
    shipment.status = ShipmentStatusEnum.DELIVERED;

    const order = await this.orderRepository.findOne({
      where: {
        id: shipment.order_id,
      },
      relations: ['address'],
    });
    order.is_paid = true;

    await this.shipmentRepository.save(shipment);

    await this.orderRepository.save(order);

    await this.orderGateway.notifyOrderStatusChange({
      action: ShipmentStatusEnum.DELIVERED,
      to_rooms: ['admin', shipment.order.user_id],
      body: {
        shipment,
        order,
        warehouse: shipment.warehouse,
        client: shipment.order.user,
        driver: null,
      },
    });
    await this.notificationService.create(
      new NotificationEntity({
        user_id: order.user_id,
        url: order.id,
        type: NotificationTypes.ORDERS,
        title_ar: 'تحديث الطلب',
        title_en: 'order updated',
        text_ar: 'تم تسليم الطلب',
        text_en: 'order delivered',
      }),
    );
    return shipment;
  }
  async pickupShipment(id: string) {
    const driver = await this.getDriver();
    if (!driver) {
      throw new NotFoundException('Driver not found');
    }
    const shipment = await this.shipmentRepository.findOne({
      where: {
        id: id,
        warehouse_id: driver.warehouse_id,
      },
      relations: ['order', 'warehouse', 'order.user', 'order.address'],
    });
    if (!shipment || shipment.status !== ShipmentStatusEnum.READY_FOR_PICKUP) {
      throw new NotFoundException('message.shipment_not_found');
    }

    shipment.order_shipped_at = new Date();
    shipment.status = ShipmentStatusEnum.PICKED_UP;

    await this.shipmentRepository.save(shipment);

    await this.orderGateway.notifyOrderStatusChange({
      action: ShipmentStatusEnum.PICKED_UP,
      to_rooms: ['admin', shipment.order.user_id, shipment.driver_id],
      body: {
        shipment,
        order: shipment.order,
        warehouse: shipment.warehouse,
        client: shipment.order.user,
        driver,
      },
    });
    await this.notificationService.create(
      new NotificationEntity({
        user_id: shipment.order.user_id,
        url: shipment.order.id,
        type: NotificationTypes.ORDERS,
        title_ar: 'تحديث الطلب',
        title_en: 'order updated',
        text_ar: 'الطلب في الطريق',
        text_en: 'order on the way',
      }),
    );
    return shipment;
  }

  async prepareShipment(id: string) {
    const shipment = await this.shipmentRepository.findOne({
      where: {
        id: id,
      },
      relations: [
        'order',
        'warehouse',
        'order.user',
        'driver',
        'driver.user',
        'order.address',
      ],
    });

    const driver = await this.getDriver(shipment?.driver?.user_id);
    if (
      !driver &&
      shipment.order.delivery_type !== DeliveryType.WAREHOUSE_PICKUP
    ) {
      throw new NotFoundException('message.driver_not_found');
    }
    if (
      !shipment ||
      ![ShipmentStatusEnum.CONFIRMED, ShipmentStatusEnum.PENDING].includes(
        shipment.status,
      )
    ) {
      throw new NotFoundException('message.shipment_not_found');
    }
    shipment.order_confirmed_at == null
      ? (shipment.order_confirmed_at = new Date())
      : null;

    shipment.order_on_processed_at = new Date();
    shipment.status = ShipmentStatusEnum.PROCESSING;

    await this.shipmentRepository.save(shipment);

    await this.orderGateway.notifyOrderStatusChange({
      action: ShipmentStatusEnum.PROCESSING,
      to_rooms: ['admin', shipment.driver_id, shipment.order.user_id],
      body: {
        shipment,
        order: shipment.order,
        warehouse: shipment.warehouse,
        client: shipment.order.user,
        driver,
      },
    });
    await this.notificationService.create(
      new NotificationEntity({
        user_id: shipment.order.user_id,
        url: shipment.order.id,
        type: NotificationTypes.ORDERS,
        title_ar: 'تحديث الطلب',
        title_en: 'order updated',
        text_ar: 'جاري تجهيز الطلب',
        text_en: 'order is under processing',
      }),
    );

    await this.notificationService.create(
      new NotificationEntity({
        user_id: shipment.driver?.user_id,
        url: shipment.order.id,
        type: NotificationTypes.ORDERS,
        title_ar: 'تحديث الطلب',
        title_en: 'order updated',
        text_ar: 'جاري تجهيز الطلب',
        text_en: 'order is under processing',
      }),
    );
    return shipment;
  }

  async shipmentReadyForPickup(id: string) {
    // const driver = await this.getDriver();
    // if (!driver) {
    //   throw new NotFoundException('Driver not found');
    // }
    const shipment = await this.shipmentRepository.findOne({
      where: {
        id: id,
      },
      relations: [
        'order',
        'warehouse',
        'order.user',
        'driver',
        'driver.user',
        'order.address',
        'shipment_products',
      ],
    });
    const driver = await this.getDriver(shipment.driver?.user_id);
    if (
      !driver &&
      shipment.order.delivery_type !== DeliveryType.WAREHOUSE_PICKUP
    ) {
      throw new NotFoundException('message.driver_not_found');
    }
    if (!shipment || shipment.status !== ShipmentStatusEnum.PROCESSING) {
      throw new NotFoundException('message.shipment_not_found');
    }

    shipment.order_ready_for_pickup_at = new Date();
    shipment.status = ShipmentStatusEnum.READY_FOR_PICKUP;

    shipment.shipment_products.forEach((product) => {
      if (!product.is_checked)
        throw new BadRequestException('message.product_not_checked');
    });
    await this.shipmentRepository.save(shipment);

    await this.orderGateway.notifyOrderStatusChange({
      action: ShipmentStatusEnum.READY_FOR_PICKUP,
      to_rooms: ['admin', shipment.driver_id, shipment.order.user_id],
      body: {
        shipment,
        order: shipment.order,
        warehouse: shipment.warehouse,
        client: shipment.order.user,
        driver,
      },
    });
    await this.notificationService.create(
      new NotificationEntity({
        user_id: shipment.order.user_id,
        url: shipment.order.id,
        type: NotificationTypes.ORDERS,
        title_ar: 'تحديث الطلب',
        title_en: 'order updated',
        text_ar: 'تم تجهيز الطلب',
        text_en: 'order ready',
      }),
    );

    await this.notificationService.create(
      new NotificationEntity({
        user_id: shipment.driver?.user_id,
        url: shipment.order.id,
        type: NotificationTypes.ORDERS,
        title_ar: 'تحديث الطلب',
        title_en: 'order updated',
        text_ar: 'تم تجهيز الطلب',
        text_en: 'order ready',
      }),
    );
    return shipment;
  }

  async acceptShipment(id: string) {
    return this.addDriverToShipment(
      id,
      AddDriverShipmentOption.DRIVER_ACCEPT_SHIPMENT,
    );
  }

  async addChatMessage(
    shipment_id: string,
    req: AddShipmentChatMessageRequest,
  ) {
    const shipment = await this.shipmentRepository.findOne({
      where: { id: shipment_id },
      relations: ['order', 'driver'],
    });

    if (!shipment) throw new NotFoundException('message.shipment_not_found');

    if (
      shipment.driver.user_id !== this.currentUser.id &&
      shipment.order.user_id !== this.currentUser.id &&
      !this.currentUser.roles.includes(Role.ADMIN) &&
      !this.currentUser.roles.includes(Role.EMPLOYEE)
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
      user_id: this.currentUser.id,
      shipment_id: shipment.id,
      attachment: attachedFile,
    });
    const savedMessage = await this.shipmentChatRepository.save(newMessage);

    const userInfo = plainToInstance(UserResponse, this.currentUser, {
      excludeExtraneousValues: true,
    });

    this.shipmentChatGateway.handleSendMessage({
      shipment,
      shipmentChat: savedMessage,
      user: userInfo,
      action: 'ADD_MESSAGE',
    });
    // if driver send message , send notification to client
    if (shipment.driver.user_id === newMessage.user_id) {
      await this.notificationService.create(
        new NotificationEntity({
          user_id: shipment.order.user_id,
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
          user_id: shipment.driver.user_id,
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
    shipment_id: string,
    query: GetCommentQueryRequest,
  ) {
    const { limit = 10, offset = 0 } = query;

    const shipment = await this.shipmentRepository.findOne({
      where: { id: shipment_id },
      relations: ['order', 'driver'],
    });
    if (!shipment) throw new NotFoundException('message.shipment_not_found');

    if (
      shipment.driver.user_id !== this.currentUser.id &&
      shipment.order.user_id !== this.currentUser.id &&
      !this.currentUser.roles.includes(Role.ADMIN) &&
      !this.currentUser.roles.includes(Role.EMPLOYEE)
    ) {
      throw new UnauthorizedException('message_not_allowed_to_view_chat');
    }

    return await this.shipmentChatRepository.find({
      where: { shipment_id },
      relations: ['user', 'attachment'],
      order: { created_at: 'DESC' },
      skip: offset,
      take: limit,
    });
  }

  async addShipmentFeedBack(
    addOrderFeedBackRequest: AddShipmentFeedBackRequest,
  ) {
    const { driver_id, delivery_time, packaging, communication, shipment_id } =
      addOrderFeedBackRequest;
    const user = this.currentUser;

    const driver = await this.driverRepository.findOne({
      where: { id: driver_id },
    });
    if (!driver) {
      throw new BadRequestException('message.driver_not_found');
    }

    const shipment = await this.shipmentRepository.findOne({
      where: { id: shipment_id },
    });
    if (!shipment) {
      throw new BadRequestException('message.shipment_not_found');
    }

    if (shipment.status !== ShipmentStatusEnum.DELIVERED) {
      throw new BadRequestException('message.shipment_not_delivered');
    }

    const shipmentFeedBack = await this.orderFeedBackRepository.findOne({
      where: { driver_id, user_id: user.id, shipment_id },
    });
    if (shipmentFeedBack) {
      throw new BadRequestException('message.feedback_already_added');
    }

    const shipmentFeedBackCreated = this.orderFeedBackRepository.create({
      driver_id,
      user_id: user.id,
      shipment_id,
      delivery_time,
      packaging,
      communication,
    });
    return this.orderFeedBackRepository.save(shipmentFeedBackCreated);
  }

  async assignDriver(shipment_id: string, driver_id: string) {
    return this.addDriverToShipment(
      shipment_id,
      AddDriverShipmentOption.DRIVER_ASSIGN_SHIPMENT,
      driver_id,
    );
  }

  async cancelShipment(shipment_id: string, req: CancelShipmentRequest) {
    const { reason_id } = req;

    const shipment = await this.shipmentRepository.findOne({
      where: { id: shipment_id },
      relations: [
        'order',
        'warehouse',
        'order.user',
        'driver',
        'driver.user',
        'order.address',
        'shipment_products',
      ],
    });

    if (!shipment) {
      throw new NotFoundException('message.shipment_not_found');
    }

    const currentUserRole = this.currentUser.roles;
    const shipmentStatus = shipment.status;
    const driver = shipment.driver
      ? await this.getDriver(
          currentUserRole.includes(Role.DRIVER)
            ? this.currentUser.id
            : shipment.driver.user_id,
        )
      : null;

    if (
      (currentUserRole.includes(Role.CLIENT) &&
        shipment.order.user_id !== this.currentUser.id) ||
      (currentUserRole.includes(Role.DRIVER) &&
        shipment.driver_id !== driver.id &&
        !currentUserRole.includes(Role.ADMIN) &&
        !currentUserRole.includes(Role.EMPLOYEE))
    ) {
      throw new UnauthorizedException('message.not_allowed_to_cancel');
    }

    if (
      (currentUserRole.includes(Role.CLIENT) &&
        shipmentStatus === ShipmentStatusEnum.PICKED_UP) ||
      (currentUserRole.includes(Role.DRIVER) &&
        shipmentStatus === ShipmentStatusEnum.PENDING) ||
      shipmentStatus ===
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

    if (
      !reason ||
      !reason.roles.some((role) => currentUserRole.includes(role))
    ) {
      throw new BadRequestException('message.reason_not_found');
    }

    if (!reason) {
      throw new BadRequestException('message.reason_not_found');
    }

    let to_rooms = ['admin', shipment.order.user_id];
    if (shipment.status === ShipmentStatusEnum.PENDING) {
      to_rooms.push(shipment.warehouse_id);
    } else {
      to_rooms.push(shipment.driver_id);
    }

    shipment.status = ShipmentStatusEnum.CANCELED;
    shipment.order_canceled_at = new Date();
    shipment.canceled_by = currentUserRole[0];
    shipment.cancelShipmentReason = reason;
    if (shipment.driver) {
      driver.current_orders = driver.current_orders - 1;
      await this.driverRepository.save(driver);
    }

    await this.shipmentRepository.save(shipment);

    const mappedImportedProducts = [];
    for (const p of shipment.shipment_products) {
      const mainProductMeasurement =
        await this.productMeasurementRepository.findOne({
          where: {
            product_id: p.product_id,
            is_main_unit: true,
          },
        });
      mappedImportedProducts.push({
        product_id: p.product_id,
        product_measurement_id: mainProductMeasurement.id,
        quantity: p.quantity * p.conversion_factor,
      });
    }

    await this.warehouseOperationTransaction.run({
      products: mappedImportedProducts,
      warehouse_id: shipment.warehouse_id,
      type: operationType.CANCEL_ORDER,
    });

    await this.orderGateway.notifyOrderStatusChange({
      action: ShipmentStatusEnum.CANCELED,
      to_rooms,
      body: {
        shipment,
        order: shipment.order,
        warehouse: shipment.warehouse,
        client: shipment.order.user,
        driver: shipment.driver,
      },
    });

    // await this.notificationService.create(
    //   new NotificationEntity({
    //     user_id: shipment.order.user_id,
    //     url: shipment.order.id,
    //     type: NotificationTypes.ORDERS,
    //     title_ar: 'الغاء الطلب',
    //     title_en: 'order cancel',
    //     text_ar: 'تم الغاء الطلب',
    //     text_en: 'the request has been canceled',
    //   }),
    // );

    if (shipment.order.payment_method != PaymentMethodEnum.CASH) {
      await this.transactionService.makeTransaction(
        new MakeTransactionRequest({
          amount: shipment.order.total_price,
          type: TransactionTypes.ORDER_RETURN,
          order_id: shipment.order.id,
          user_id: shipment.order.user_id,
        }),
      );
    }

    if (shipment.driver) {
      await this.notificationService.create(
        new NotificationEntity({
          user_id: shipment.driver.user_id,
          url: shipment.order.id,
          type: NotificationTypes.ORDERS,
          title_ar: 'تحديث الطلب',
          title_en: 'order updated',
          text_ar: 'تم الغاء الطلب',
          text_en: 'the request has been canceled',
        }),
      );
    }
    delete shipment.shipment_products;
    return shipment;
  }

  get currentUser() {
    return this.request.user;
  }

  async assignDriverToShipment(
    shipment_id: string,
    driver_id?: string,
  ): Promise<Shipment> {
    const driver = await this.getDriver(driver_id);

    if (!driver) {
      throw new NotFoundException('message.driver_not_found');
    }

    driver.current_orders = driver.current_orders + 1;

    const shipment = await this.shipmentRepository.findOne({
      where: { id: shipment_id },
      relations: [
        'order',
        'warehouse',
        'order.user',
        'order.address',
        'driver',
        'driver.user',
      ],
    });

    if (!shipment) {
      throw new NotFoundException('message.shipment_not_found');
    }

    if (driver.warehouse_id !== shipment.warehouse_id) {
      throw new BadRequestException('message.driver_not_in_the_same_warehouse');
    }

    if (
      shipment.status == ShipmentStatusEnum.PENDING ||
      shipment.status == ShipmentStatusEnum.CANCELED
    ) {
      throw new BadRequestException('message.shipment_already_confirmed');
    }

    const old_driver_id = shipment.driver.user_id;
    const old_driver = await this.getDriver(old_driver_id);
    old_driver.current_orders = old_driver.current_orders - 1;
    if (old_driver.id == driver.id) {
      throw new BadRequestException('message.driver_already_assigned');
    }
    await this.driverRepository.save(old_driver);

    shipment.driver = driver;

    await this.shipmentRepository.save(shipment);

    const intialShipmentMessage = 'Shipment has been assigned to driver';

    const intialShipmentChat = this.shipmentChatRepository.create({
      message: `${intialShipmentMessage} ${driver.user.name}`,
      user_id: this.currentUser.id,
      shipment_id: shipment.id,
    });
    await this.driverRepository.save(driver);
    await this.shipmentChatRepository.save(intialShipmentChat);

    const gateway_action = 'ASSIGNED';

    const to_rooms = ['admin', shipment.order.user_id];

    to_rooms.push(shipment.driver_id);

    await this.orderGateway.notifyOrderStatusChange({
      action: gateway_action,
      to_rooms,
      body: {
        shipment: shipment,
        order: shipment.order,
        warehouse: shipment.warehouse,
        client: shipment.order.user,
        driver: driver,
      },
    });

    await this.notificationService.create(
      new NotificationEntity({
        user_id: old_driver_id,
        url: old_driver_id,
        type: NotificationTypes.ORDERS,
        title_ar: 'تم تعيين سائق اخر على الطلب',
        title_en: 'order has been assigned to another driver',
        text_ar: 'تم تعيين سائق اخر على الطلب',
        text_en: 'order has been assigned to another driver',
      }),
    );

    await this.notificationService.create(
      new NotificationEntity({
        user_id: driver.user_id,
        url: shipment.order.id,
        type: NotificationTypes.ORDERS,
        title_ar: 'تحديث الطلب',
        title_en: 'order updated',
        text_ar: 'تم تعيين سائق للطلب',
        text_en: 'A driver has been assigned to the request',
      }),
    );
    return shipment;
  }
  private async addDriverToShipment(
    shipment_id: string,
    action: AddDriverShipmentOption,
    driver_id?: string,
  ): Promise<Shipment> {
    const driver = await this.getDriver(driver_id);

    if (!driver) {
      throw new NotFoundException('message.driver_not_found');
    }
    if (action == AddDriverShipmentOption.DRIVER_ACCEPT_SHIPMENT) {
      const max_orders = await this.constantRepository.findOne({
        where: { type: ConstantType.ORDER_LIMIT },
      });
      if (driver.current_orders >= Number(max_orders.variable)) {
        throw new BadRequestException(
          'message.driver_has_reached_maximum_number_of_orders',
        );
      }
    }
    driver.current_orders = driver.current_orders + 1;

    const shipment = await this.shipmentRepository.findOne({
      where: { id: shipment_id },
      relations: ['order', 'warehouse', 'order.user', 'order.address'],
    });

    if (!shipment) {
      throw new NotFoundException('message.shipment_not_found');
    }

    if (driver.warehouse_id !== shipment.warehouse_id) {
      throw new BadRequestException('message.driver_not_in_the_same_warehouse');
    }

    if (shipment.status !== ShipmentStatusEnum.PENDING) {
      throw new BadRequestException('message.shipment_already_confirmed');
    }

    shipment.order_confirmed_at = new Date();
    shipment.driver_id = driver.id;

    shipment.status = ShipmentStatusEnum.CONFIRMED;

    await this.shipmentRepository.save(shipment);

    let intialShipmentMessage =
      action === AddDriverShipmentOption.DRIVER_ASSIGN_SHIPMENT
        ? 'Shipment has been assigned to driver'
        : 'Shipment has been accepted by driver';

    const intialShipmentChat = this.shipmentChatRepository.create({
      message: `${intialShipmentMessage} ${driver.user.name}`,
      user_id: this.currentUser.id,
      shipment_id: shipment.id,
    });
    await this.driverRepository.save(driver);
    await this.shipmentChatRepository.save(intialShipmentChat);

    const gateway_action =
      action === AddDriverShipmentOption.DRIVER_ASSIGN_SHIPMENT
        ? 'ASSIGNED'
        : ShipmentStatusEnum.CONFIRMED;

    const to_rooms = ['admin', shipment.order.user_id];
    if (action === AddDriverShipmentOption.DRIVER_ASSIGN_SHIPMENT) {
      if (shipment.order.delivery_type === DeliveryType.FAST) {
        // if he assigned to fast delivery, notify the drivers in the warehouse. to avoid double accept
        to_rooms.push(shipment.warehouse_id);
      } else {
        to_rooms.push(shipment.driver_id);
      }
    } else {
      to_rooms.push(shipment.warehouse_id);
    }

    await this.orderGateway.notifyOrderStatusChange({
      action: gateway_action,
      to_rooms,
      body: {
        shipment: shipment,
        order: shipment.order,
        warehouse: shipment.warehouse,
        client: shipment.order.user,
        driver: driver,
      },
    });

    await this.notificationService.create(
      new NotificationEntity({
        user_id: shipment.order.user_id,
        url: shipment.order.id,
        type: NotificationTypes.ORDERS,
        title_ar: 'تحديث الطلب',
        title_en: 'order updated',
        text_ar: 'تم تاكيد الطلب',
        text_en: 'order confirmed',
      }),
    );

    await this.notificationService.create(
      new NotificationEntity({
        user_id: driver.user_id,
        url: shipment.order.id,
        type: NotificationTypes.ORDERS,
        title_ar: 'تحديث الطلب',
        title_en: 'order updated',
        text_ar: 'تم تعيين سائق للطلب',
        text_en: 'A driver has been assigned to the request',
      }),
    );
    return shipment;
  }

  async checkShipmentProduct(id: string) {
    const product = await this.shipmentProductRepository.findOne({
      where: { id },
    });
    if (!product) {
      throw new NotFoundException('message.shipment_not_found');
    }
    product.is_checked = !product.is_checked;
    await this.shipmentProductRepository.save(product);
    return product;
  }

  async addProductToShipment(req: AddProductOrderRequest) {
    const shipment = await this.shipmentRepository.findOne({
      where: {
        id: req.shipment_id,
      },
      relations: { order: true },
    });
    if (
      shipment.status == ShipmentStatusEnum.DELIVERED ||
      shipment.status == ShipmentStatusEnum.CANCELED
    ) {
      throw new BadRequestException('message.cannot_add_product_to_shipment');
    }

    const product_price = await this.productCategoryPriceRepository.findOne({
      where: {
        id: req.product_category_price_id,
      },
      relations: {
        product_measurement: { measurement_unit: true },
        product_offer: true,
        product_additional_services: true,
        product_sub_category: {
          category_subCategory: { section_category: true },
        },
      },
    });
    const original_price = product_price.price;
    const nearst_warehouse = await this.warehouseRepository.findOne({
      where: { id: shipment.order.warehouse_id },
    });

    const warehouse_product = await this.warehouseProductsRepository.findOne({
      where: {
        warehouse_id: nearst_warehouse.id,
        product_id: product_price.product_measurement.product_id,
      },
    });
    if (!warehouse_product) {
      throw new BadRequestException('message.warehouse_product_not_enough');
    }

    const is_offer =
      product_price.product_offer &&
      product_price.product_offer.offer_quantity > 0 &&
      product_price.product_offer.is_active &&
      product_price.product_offer.start_date < new Date() &&
      new Date() < product_price.product_offer.end_date &&
      product_price.product_offer.offer_quantity >=
        product_price.min_order_quantity;
    if (is_offer) {
      product_price.min_order_quantity =
        product_price.product_offer.min_offer_quantity;
      product_price.max_order_quantity =
        product_price.product_offer.max_offer_quantity;
      product_price.price = product_price.product_offer.price;
    }

    // warehouse_product.quantity =
    //   warehouse_product.quantity -
    //   product_price.min_order_quantity *
    //     product_price.product_measurement.conversion_factor;

    warehouse_product.quantity =
      warehouse_product.quantity -
      req.quantity * product_price.product_measurement.conversion_factor;

    if (warehouse_product.quantity < 0) {
      throw new BadRequestException('message.warehouse_product_not_enough');
    }
    await this.warehouseProductsRepository.save(warehouse_product);

    const shipmentProduct = await this.shipmentProductRepository.save(
      new ShipmentProduct({
        shipment_id: req.shipment_id,
        is_offer: is_offer,
        quantity: req.quantity,
        section_id:
          product_price.product_sub_category.category_subCategory
            .section_category.section_id,

        product_id: product_price.product_sub_category.product_id,
        product_category_price_id: req.product_category_price_id,
        price: original_price,
        conversion_factor: product_price.product_measurement.conversion_factor,
        main_measurement_id:
          product_price.product_measurement.measurement_unit_id,
      }),
    );
    shipment.order.products_price =
      Number(shipment.order.products_price) +
      Number(original_price * req.quantity);
    shipment.order.total_price =
      Number(shipment.order.total_price) +
      Number(original_price * req.quantity);

    await this.orderRepository.save(shipment.order);

    const shipmentProductHistoryCreate =
      this.shipmentProductHistoryRepository.create({
        shipment_id: shipment.id,

        modified_by_id: this.currentUser.id,
        action_type: ShipmentProductActionType.CREATE,
        additions: shipmentProduct.additions,
        conversion_factor: shipmentProduct.conversion_factor,
        is_offer: shipmentProduct.is_offer,
        quantity: shipmentProduct.quantity,
        shipment_product_id: shipmentProduct.id,
        price: shipmentProduct.price,
        total_price: Number(shipmentProduct.price * shipmentProduct.quantity),
      });

    await this.shipmentProductHistoryRepository.save(
      shipmentProductHistoryCreate,
    );

    return shipmentProduct;
  }

  async removeShipmentProduct(id: string) {
    // Fetch the ShipmentProduct entity by ID with related Shipment and Order.
    const shipmentProduct = await this.shipmentProductRepository.findOne({
      where: { id },
      relations: { shipment: { order: true } }, // Including related shipment and order details.
    });

    // If the ShipmentProduct is not found, throw a "Not Found" exception.
    if (!shipmentProduct) {
      throw new NotFoundException('message.shipment_not_found');
    }

    // Prevent removal if the shipment status is DELIVERED or CANCELED.
    if (
      shipmentProduct.shipment.status == ShipmentStatusEnum.DELIVERED ||
      shipmentProduct.shipment.status == ShipmentStatusEnum.CANCELED
    ) {
      throw new BadRequestException(
        'message.cannot_remove_product_from_shipment',
      );
    }

    // Find the corresponding WarehouseProduct (to update its stock later).
    const warehouse_product = await this.warehouseProductsRepository.findOne({
      where: {
        warehouse_id: shipmentProduct.shipment.order.warehouse_id,
        product_id: shipmentProduct.product_id,
      },
    });

    // If the product does not exist in the warehouse, throw an exception.
    if (!warehouse_product) {
      throw new BadRequestException('message.warehouse_product_not_found');
    }

    // Adjust the quantity in the warehouse (restore the quantity of the removed product).
    warehouse_product.quantity +=
      shipmentProduct.quantity / shipmentProduct.conversion_factor;

    // Create a record in the ShipmentProductHistory to log the deletion.
    const shipmentProductHistoryCreate =
      this.shipmentProductHistoryRepository.create({
        shipment_id: shipmentProduct.shipment_id,
        modified_by_id: this.currentUser.id, // Log the user who performed the action.
        action_type: ShipmentProductActionType.DELETE, // Action type is DELETE.
        additions: shipmentProduct.additions, // Any additions associated with the product.
        conversion_factor: shipmentProduct.conversion_factor,
        is_offer: shipmentProduct.is_offer,
        quantity: shipmentProduct.quantity, // Log the product quantity being removed.
        shipment_product_id: shipmentProduct.id, // Reference to the original ShipmentProduct.
        price: shipmentProduct.price, // Store the product's price.
        total_price: Number(shipmentProduct.price * shipmentProduct.quantity), // Calculate total price of the product being removed.
      });

    // Save the history record.
    await this.shipmentProductHistoryRepository.save(
      shipmentProductHistoryCreate,
    );

    // Update the warehouse product quantity and save the changes.
    await this.warehouseProductsRepository.save(warehouse_product);

    // Remove the product from the shipment.
    await this.shipmentProductRepository.softDelete(shipmentProduct.id);

    // Adjust the total order price by subtracting the removed product's total cost.
    shipmentProduct.shipment.order.total_price =
      shipmentProduct.shipment.order.total_price -
      shipmentProduct.quantity * shipmentProduct.price;

    // Adjust the products price in the order.
    shipmentProduct.shipment.order.products_price =
      shipmentProduct.shipment.order.products_price -
      shipmentProduct.quantity * shipmentProduct.price;

    // Save the updated order with the new prices.
    await this.orderRepository.save(shipmentProduct.shipment.order);

    // Return the removed shipment product.
    return shipmentProduct;
  }
  async getAllShipmentProductHistories(shipment_id: string) {
    return await this.shipmentProductHistoryRepository.find({
      where: { shipment_id: shipment_id },
      withDeleted: true,
      relations: {
        modified_by: true,

        shipment_product: {
          main_measurement_unit: true,
          product: {
            product_images: true,
          },
          product_category_price: {
            product_sub_category: {
              category_subCategory: {
                section_category: { category: true },
                subcategory: true,
              },
            },
          },
        },
      },
      order: { created_at: 'DESC' },
    });
  }

  async getAllOrderHistories(order_id: string) {
    return await this.order_history_repo.find({
      where: { order_id: order_id },
      relations: { modified_by: true },
      order: { created_at: 'DESC' },
    });
  }
}
