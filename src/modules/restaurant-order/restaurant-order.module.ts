import { Module } from '@nestjs/common';
import { RestaurantOrderController } from './restaurant-order.controller';
import { RestaurantOrderService } from './restaurant-order.service';
import { MakeRestaurantOrderTransaction } from './util/make-restaureant-order.transaction';
import { PaymentMethodService } from '../payment_method/payment_method.service';
import { OrderGateway } from 'src/integration/gateways/order.gateway';
import { NotificationModule } from '../notification/notification.module';
import { AdminRestaurantOrderController } from './admin-restaurant-order.controller';
import { TransactionService } from '../transaction/transaction.service';
import { ReasonService } from '../reason/reason.service';

@Module({
  controllers: [RestaurantOrderController,AdminRestaurantOrderController],
  providers: [RestaurantOrderService,MakeRestaurantOrderTransaction,PaymentMethodService,OrderGateway,TransactionService,ReasonService],
  imports:[NotificationModule]
})
export class RestaurantOrderModule {}
