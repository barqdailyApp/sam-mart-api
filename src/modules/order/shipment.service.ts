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
import { Repository } from 'typeorm';

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
@Injectable()
export class ShipmentService extends BaseService<Shipment> {
  constructor(
    @InjectRepository(Driver)
    private driverRepository: Repository<Driver>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Shipment)
    private shipmentRepository: Repository<Shipment>,
    @InjectRepository(ShipmentChat)
    private shipmentChatRepository: Repository<ShipmentChat>,
    @InjectRepository(Constant)
    private constantRepository: Repository<Constant>,
    @InjectRepository(ShipmentChatAttachment)
    private shipmentChatAttachmentRepository: Repository<ShipmentChatAttachment>,

    private readonly shipmentChatGateway: ShipmentChatGateway,
    private readonly orderGateway: OrderGateway,

    @InjectRepository(ShipmentFeedback)
    private orderFeedBackRepository: Repository<ShipmentFeedback>,
    @Inject(REQUEST) private readonly request: Request,
    @Inject(FileService) private _fileService: FileService,
    @Inject(ReasonService)
    private readonly reasonService: ReasonService,

    private readonly notificationService: NotificationService,
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
      throw new NotFoundException('Driver not found');
    }
    driver.current_orders = driver.current_orders - 1;
    const shipment = await this.shipmentRepository.findOne({
      where: {
        id: id,
        warehouse_id: driver.warehouse_id,
      },
      relations: ['order', 'warehouse', 'order.user'],
    });

    if (!shipment || shipment.status !== ShipmentStatusEnum.PICKED_UP) {
      throw new NotFoundException('Shipment not found');
    }

    shipment.order_delivered_at = new Date();
    shipment.status = ShipmentStatusEnum.DELIVERED;

    await this.shipmentRepository.save(shipment);
    const order = await this.orderRepository.findOne({
      where: {
        id: shipment.order_id,
      },
      relations: ['address'],
    });
    order.is_paid = true;
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
        text_ar: 'تم توصيل الطلب بنجاح',
        text_en: 'The order was delivered successfully',
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
    if (!shipment || shipment.status !== ShipmentStatusEnum.PROCESSING) {
      throw new NotFoundException('Shipment not found');
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
        text_ar: 'تم خروج الطلب من المخزن بنجاح',
        text_en: 'The order has been successfully removed from the warehouse',
      }),
    );
    return shipment;
  }

  async prepareShipment(id: string) {
    const shipment = await this.shipmentRepository.findOne({
      where: {
        id: id,
      },
      relations: ['order', 'warehouse', 'order.user', 'driver', 'driver.user'],
    });
  
    const driver = await this.getDriver(shipment.driver.user_id);
    if (!driver) {
      throw new NotFoundException('Driver not found');
    }
    if (!shipment || shipment.status !== ShipmentStatusEnum.CONFIRMED) {
      throw new NotFoundException('Shipment not found');
    }

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
        text_ar: 'جارى تجهيز الطلب',
        text_en: 'order is being prepared',
      }),
    );

    await this.notificationService.create(
      new NotificationEntity({
        user_id: shipment.driver.user_id,
        url: shipment.order.id,
        type: NotificationTypes.ORDERS,
        title_ar: 'تحديث الطلب',
        title_en: 'order updated',
        text_ar: 'جارى تجهيز الطلب',
        text_en: 'order is being prepared',
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
      relations: ['order', 'warehouse', 'order.user', 'driver', 'driver.user'],
    });
    const driver = await this.getDriver(shipment.driver.user_id);
    if (!driver) {
      throw new NotFoundException('Driver not found');
    }
    if (!shipment || shipment.status !== ShipmentStatusEnum.PROCESSING) {
      throw new NotFoundException('Shipment not found');
    }

    shipment.order_ready_for_pickup_at = new Date();
    shipment.status = ShipmentStatusEnum.READY_FOR_PICKUP;

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
        text_ar: 'تم تجهز الطلب من المخزن بنجاح',
        text_en: 'The order has been successfully removed from the warehouse',
      }),
    );

    await this.notificationService.create(
      new NotificationEntity({
        user_id: shipment.driver.user_id,
        url: shipment.order.id,
        type: NotificationTypes.ORDERS,
        title_ar: 'تحديث الطلب',
        title_en: 'order updated',
        text_ar: 'تم تجهز الطلب من المخزن بنجاح',
        text_en: 'The order has been successfully removed from the warehouse',
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

    if (!shipment) throw new NotFoundException('Shipment not found');

    if (
      shipment.driver.user_id !== this.currentUser.id &&
      shipment.order.user_id !== this.currentUser.id &&
      !this.currentUser.roles.includes(Role.ADMIN)
    ) {
      throw new UnauthorizedException(
        'You are not allowed to add chat message to this shipment',
      );
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
    if (!shipment) throw new NotFoundException('Shipment not found');

    if (
      shipment.driver.user_id !== this.currentUser.id &&
      shipment.order.user_id !== this.currentUser.id &&
      !this.currentUser.roles.includes(Role.ADMIN)
    ) {
      throw new UnauthorizedException(
        'You are not allowed to view this shipment chat',
      );
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
      throw new BadRequestException('Driver not found');
    }

    const shipment = await this.shipmentRepository.findOne({
      where: { id: shipment_id },
    });
    if (!shipment) {
      throw new BadRequestException('Shipment not found');
    }

    if (shipment.status !== ShipmentStatusEnum.DELIVERED) {
      throw new BadRequestException('Shipment is not delivered');
    }

    const shipmentFeedBack = await this.orderFeedBackRepository.findOne({
      where: { driver_id, user_id: user.id, shipment_id },
    });
    if (shipmentFeedBack) {
      throw new BadRequestException('Feedback already added');
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
      ],
    });

    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }

    const currentUserRole = this.currentUser.roles;
    const shipmentStatus = shipment.status;
    const driver = await this.getDriver(this.currentUser.id);

    if (
      (currentUserRole.includes(Role.CLIENT) &&
        shipment.order.user_id !== this.currentUser.id) ||
      (currentUserRole.includes(Role.DRIVER) &&
        shipment.driver_id !== driver.id &&
        !currentUserRole.includes(Role.ADMIN))
    ) {
      throw new UnauthorizedException(
        'You are not allowed to cancel this shipment',
      );
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
      throw new BadRequestException('Shipment cannot be canceled');
    }

    const reason = await this.reasonService.findOne({
      id: reason_id,
      type: ReasonType.CANCEL_ORDER
    });

    if (
      !reason ||
      !reason.roles.some(role => currentUserRole.includes(role))
    ) {
      throw new BadRequestException('Reason not found');
    }

    if (!reason) {
      throw new BadRequestException('Reason not found');
    }

    let to_rooms = ['admin', shipment.order.user_id];
    if (shipment.status === ShipmentStatusEnum.PENDING) {
      to_rooms.push(shipment.warehouse_id);
    } else {
      to_rooms.push(shipment.driver_id);
    }

    shipment.status = ShipmentStatusEnum.CANCELED;
    shipment.order_canceled_at = new Date();
    shipment.cancelShipmentReason = reason;

    await this.shipmentRepository.save(shipment);

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

    await this.notificationService.create(
      new NotificationEntity({
        user_id: shipment.order.user_id,
        url: shipment.order.id,
        type: NotificationTypes.ORDERS,
        title_ar: 'الغاء الطلب',
        title_en: 'order cancel',
        text_ar: 'تم الغاء الطلب',
        text_en: 'the request has been canceled',
      }),
    );
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
    return shipment;
  }

  get currentUser() {
    return this.request.user;
  }

  private async addDriverToShipment(
    shipment_id: string,
    action: AddDriverShipmentOption,
    driver_id?: string,
  ): Promise<Shipment> {
    const driver = await this.getDriver(driver_id);

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }
    const max_orders = await this.constantRepository.findOne({
      where: { type: ConstantType.ORDER_LIMIT },
    });
    if (driver.current_orders >= Number(max_orders.variable)) {
      throw new BadRequestException(
        'Driver has reached the maximum number of orders',
      );
    }
    driver.current_orders = driver.current_orders + 1;

    const shipment = await this.shipmentRepository.findOne({
      where: { id: shipment_id },
      relations: ['order', 'warehouse', 'order.user', 'order.address'],
    });

    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }

    if (driver.warehouse_id !== shipment.warehouse_id) {
      throw new BadRequestException('Driver not in the same warehouse');
    }

    if (shipment.status !== ShipmentStatusEnum.PENDING) {
      throw new BadRequestException('Shipment already confirmed');
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

    const to_rooms = ['admin'];
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
        text_ar: 'تم تعيين سائق للطلب',
        text_en: 'A driver has been assigned to the request',
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
}
