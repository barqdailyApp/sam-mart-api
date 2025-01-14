import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RestaurantCart } from 'src/infrastructure/entities/restaurant/restaurant-cart.entity';
import { In, Repository } from 'typeorm';
import { AddMealRestaurantCartTransaction } from './util/add-meal-restaurant-cart.transaction';
import { AddMealRestaurantCartRequest } from './dto/request/add-meal-restaurant-cart.request';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { plainToInstance } from 'class-transformer';
import { GetCartMealsResponse } from './dto/response/get-cart-meals.response';

@Injectable()
export class RestaurantCartService {
  constructor(
    private readonly addMealTransaction: AddMealRestaurantCartTransaction,
    @InjectRepository(RestaurantCart)
    private readonly restaurantCartRepository: Repository<RestaurantCart>,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  async addMealToCart(req: AddMealRestaurantCartRequest) {
    return await this.addMealTransaction.run(req);
  }
  async getCartMeals() {
    const cart = await this.restaurantCartRepository.findOne({
      where: { user_id: this.request.user.id },
      relations: { restaurant_cart_meals:{meal:true,cart_meal_options:{option:true}} ,  },
    });
    const response = plainToInstance(GetCartMealsResponse, cart.restaurant_cart_meals.map((m) => {const total_unit_price=Number(m.meal.price)+Number(m.cart_meal_options.reduce((acc,curr)=>acc+curr.option.price,0));return {...m.meal,total_price:total_unit_price}}), {
      excludeExtraneousValues: true,
    });
    return response;
  }
}
