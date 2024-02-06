import { Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
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
@Injectable()
export class ShipmentService extends BaseService<Shipment> {
  constructor(
    @InjectRepository(Driver)
    private driverRepository: Repository<Driver>,
    @InjectRepository(Shipment)
    private shipmentRepository: Repository<Shipment>,
    @InjectRepository(ShipmentChat)
    private shipmentChatRepository: Repository<ShipmentChat>,
    @InjectRepository(ShipmentChatAttachment)
    private shipmentChatAttachmentRepository: Repository<ShipmentChatAttachment>,

    @Inject(REQUEST) private readonly request: Request,
    @Inject(FileService) private _fileService: FileService,
  ) {
    super(shipmentRepository);
  }

  async getDriver() {
    return await this.driverRepository.findOne({
      where: {
        user_id: this.request.user.id,
      },
    });
  }
  async acceptShipment(id: string) {
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

    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }

    shipment.order_confirmed_at = new Date();
    shipment.status = ShipmentStatusEnum.CONFIRMED;
    shipment.driver_id = driver.id;
    await this.shipmentRepository.save(shipment);

    const intialShipmentMessage = this.shipmentChatRepository.create({
      message: `Shipment has been accepted by driver ${driver.user.name}`,
      user_id: this.request.user.id,
      shipment_id: shipment.id,
    });
    await this.shipmentChatRepository.save(intialShipmentMessage);

    return shipment;
  }

  async addChatMessage(shipment_id: string, req: AddShipmentChatMessageRequest) {
    const shipment = await this.shipmentRepository.findOne({
      where: { id: shipment_id },
      relations: ['order', 'driver']
    });

    if (!shipment) throw new NotFoundException('Shipment not found');
    console.log(shipment);

    if (
      shipment.driver.user_id !== this.currentUser.id &&
      shipment.order.user_id !== this.currentUser.id &&
      !this.currentUser.roles.includes(Role.ADMIN)
    ) {
      throw new UnauthorizedException('You are not allowed to add chat message to this shipment');
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
      })
      attachedFile = await this.shipmentChatAttachmentRepository.save(createAttachedFile);
    }

    const newMessage = this.shipmentChatRepository.create({
      message: req.message,
      user_id: this.currentUser.id,
      shipment_id: shipment.id,
      attachment: attachedFile
    });
    return await this.shipmentChatRepository.save(newMessage);

  }
  get currentUser() {
    return this.request.user;
  }

}
