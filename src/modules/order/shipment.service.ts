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
import { MakeOrderRequest } from './dto/request/make-order-request';
import { MakeOrderTransaction } from './util/make-order.transaction';
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
import { FastDeliveryGateway } from 'src/integration/gateways/fast-delivery.gateway';
import { DeliveryType } from 'src/infrastructure/data/enums/delivery-type.enum';
import { AddDriverShipmentOption } from 'src/infrastructure/data/enums/add-driver-shipment-option.enum';
import { SendOfferToDriver } from 'src/integration/gateways/interfaces/fast-delivery/send-offer-payload.response';
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
    @InjectRepository(ShipmentChatAttachment)
    private shipmentChatAttachmentRepository: Repository<ShipmentChatAttachment>,

    private readonly shipmentChatGateway: ShipmentChatGateway,
    private readonly fastdeliveryGateway: FastDeliveryGateway,
    @InjectRepository(ShipmentFeedback)
    private orderFeedBackRepository: Repository<ShipmentFeedback>,
    @Inject(REQUEST) private readonly request: Request,
    @Inject(FileService) private _fileService: FileService,
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
    const shipment = await this.shipmentRepository.findOne({
      where: {
        id: id,
        warehouse_id: driver.warehouse_id,
      },
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
    });
    order.is_paid = true;
    await this.orderRepository.save(order);
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
    });
    if (!shipment || shipment.status !== ShipmentStatusEnum.PROCESSING) {
      throw new NotFoundException('Shipment not found');
    }

    shipment.order_shipped_at = new Date();
    shipment.status = ShipmentStatusEnum.PICKED_UP;

    await this.shipmentRepository.save(shipment);

    return shipment;
  }

  async prepareShipment(id: string) {
    const driver = await this.getDriver();
    if (!driver) {
      throw new NotFoundException('Driver not found');
    }
    const shipment = await this.shipmentRepository.findOne({
      where: {
        id: id,
        warehouse_id: driver.warehouse_id,
      },
    });
    if (!shipment || shipment.status !== ShipmentStatusEnum.CONFIRMED) {
      throw new NotFoundException('Shipment not found');
    }

    shipment.order_on_processed_at = new Date();
    shipment.status = ShipmentStatusEnum.PROCESSING;

    await this.shipmentRepository.save(shipment);

    return shipment;
  }

  async acceptShipment(id: string) {
    return this.addDriverToShipment(id, AddDriverShipmentOption.DRIVER_ACCEPT_SHIPMENT);
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

  get currentUser() {
    return this.request.user;
  }


  private async addDriverToShipment(
    shipment_id: string,
    action: AddDriverShipmentOption,
    driver_id?: string
  ): Promise<Shipment> {
    const driver = await this.getDriver(driver_id);

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    const shipment = await this.shipmentRepository.findOne({
      where: { id: shipment_id },
      relations: ['order'],
    });

    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }

    shipment.order_confirmed_at = new Date();
    shipment.status = ShipmentStatusEnum.CONFIRMED;
    shipment.driver_id = driver.id;
    await this.shipmentRepository.save(shipment);


    let fastDeliveryGatewayPayload: SendOfferToDriver = {
      action: AddDriverShipmentOption.DRIVER_ACCEPT_SHIPMENT,
      shipment,
    };

    let intialShipmentMessage = 'Shipment has been accepted by driver';

    if (action == AddDriverShipmentOption.DRIVER_ASSIGN_SHIPMENT) {
      fastDeliveryGatewayPayload.action = AddDriverShipmentOption.DRIVER_ASSIGN_SHIPMENT;
      intialShipmentMessage = 'Shipment has been assigned to driver'
    }

    const intialShipmentChat = this.shipmentChatRepository.create({
      message: `${intialShipmentMessage} ${driver.user.name}`,
      user_id: shipment.driver_id,
      shipment_id: shipment.id,
    });

    await this.shipmentChatRepository.save(intialShipmentChat);

    if (shipment.order.delivery_type === DeliveryType.FAST) {
      await this.fastdeliveryGateway.notifyShipmentStatusChange(fastDeliveryGatewayPayload);
    }

    return shipment;
  }
}
