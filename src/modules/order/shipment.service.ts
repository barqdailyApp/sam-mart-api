import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { BaseUserService } from 'src/core/base/service/user-service.base';
import { Order } from 'src/infrastructure/entities/order/order.entity';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MakeOrderRequest } from './dto/make-order-request';
import { MakeOrderTransaction } from './util/make-order.transaction';
import { Shipment } from 'src/infrastructure/entities/order/shipment.entity';
import { BaseService } from 'src/core/base/service/service.base';
import { Driver } from 'src/infrastructure/entities/driver/driver.entity';
import { ShipmentStatusEnum } from 'src/infrastructure/data/enums/shipment_status.enum';
import { ShipmentChat } from 'src/infrastructure/entities/order/shipment-chat.entity';
@Injectable()
export class ShipmentService extends BaseService<Shipment> {
  constructor(
    @InjectRepository(Driver) private driverRepository: Repository<Driver>,
    @InjectRepository(Shipment)
    private shipmentRepository: Repository<Shipment>,
    @InjectRepository(ShipmentChat) private shipmentChatRepository: Repository<ShipmentChat>,
    @Inject(REQUEST) private readonly request: Request,
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
      message: 'Shipment has been accepted',
      user_id: this.request.user.id,
      shipment_id: shipment.id,
    });
    await this.shipmentChatRepository.save(intialShipmentMessage);

    return shipment;
  }
}
