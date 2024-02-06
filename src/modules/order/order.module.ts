import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { MakeOrderTransaction } from './util/make-order.transaction';
import { ShipmentController } from './shipment.controller';
import { ShipmentService } from './shipment.service';

@Module({
  controllers: [OrderController, ShipmentController],
  providers: [OrderService, MakeOrderTransaction, ShipmentService]
})
export class OrderModule { }
