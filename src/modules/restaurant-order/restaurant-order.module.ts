import { Module } from '@nestjs/common';
import { RestaurantOrderController } from './restaurant-order.controller';
import { RestaurantOrderService } from './restaurant-order.service';
import { MakeRestaurantOrderTransaction } from './util/make-restaureant-order.transaction';

@Module({
  controllers: [RestaurantOrderController],
  providers: [RestaurantOrderService,MakeRestaurantOrderTransaction]
})
export class RestaurantOrderModule {}
