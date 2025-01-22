import { Module } from '@nestjs/common';
import { RestaurantOrderController } from './restaurant-order.controller';
import { RestaurantOrderService } from './restaurant-order.service';

@Module({
  controllers: [RestaurantOrderController],
  providers: [RestaurantOrderService]
})
export class RestaurantOrderModule {}
