import { Module } from '@nestjs/common';
import { RestaurantOrderController } from './restaurant-order.controller';
import { RestaurantOrderService } from './restaurant-order.service';
import { MakeRestaurantOrderTransaction } from './util/make-restaureant-order.transaction';
import { PaymentMethodService } from '../payment_method/payment_method.service';
import { OrderGateway } from 'src/integration/gateways/order.gateway';
import { NotificationModule } from '../notification/notification.module';

@Module({
  controllers: [RestaurantOrderController],
  providers: [RestaurantOrderService,MakeRestaurantOrderTransaction,PaymentMethodService,OrderGateway,],
  imports:[NotificationModule]
})
export class RestaurantOrderModule {}
