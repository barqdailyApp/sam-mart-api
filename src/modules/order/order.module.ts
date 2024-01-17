import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { MakeOrderTransaction } from './util/make-order.transaction';

@Module({
  controllers: [OrderController],
  providers: [OrderService,MakeOrderTransaction]
})
export class OrderModule {}
