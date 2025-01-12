import { Module } from '@nestjs/common';
import { RestaurantCartService } from './restaurant-cart.service';
import { AddMealRestaurantCartTransaction } from './util/add-meal-restaurant-cart.transaction';
import { RestaurantCartController } from './restaurant-cart.controller';

@Module({
  controllers: [RestaurantCartController],
  providers: [RestaurantCartService,AddMealRestaurantCartTransaction]
})
export class RestaurantCartModule {}
