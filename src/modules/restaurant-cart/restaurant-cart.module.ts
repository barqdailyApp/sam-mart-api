import { Module } from '@nestjs/common';
import { RestaurantCartService } from './restaurant-cart.service';
import { AddMealRestaurantCartTransaction } from './util/add-meal-restaurant-cart.transaction';
import { RestaurantCartController } from './restaurant-cart.controller';
import { UpdateMealRestaurantCartTransaction } from './util/update-meal-restaurant-cart.transaction';

@Module({
  controllers: [RestaurantCartController],
  providers: [RestaurantCartService,AddMealRestaurantCartTransaction,UpdateMealRestaurantCartTransaction]
})
export class RestaurantCartModule {}
