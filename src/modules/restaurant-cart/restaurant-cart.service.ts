import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RestaurantCart } from 'src/infrastructure/entities/restaurant/cart/restaurant-cart.entity';
import { In, Repository } from 'typeorm';
import { AddMealRestaurantCartTransaction } from './util/add-meal-restaurant-cart.transaction';
import { AddMealRestaurantCartRequest } from './dto/request/add-meal-restaurant-cart.request';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { plainToInstance } from 'class-transformer';
import { GetCartMealsResponse } from './dto/response/get-cart-meals.response';
import { RestaurantCartMeal } from 'src/infrastructure/entities/restaurant/cart/restaurant-cart-meal.entity';
import { RestaurantCartMealOption } from 'src/infrastructure/entities/restaurant/cart/restaurant-cart-meal-option.entity';
import { UpdateCartMealRequest } from './dto/request/update-cart-item.request';
import { UpdateMealRestaurantCartTransaction } from './util/update-meal-restaurant-cart.transaction';
import { RestaurantResponse } from '../restaurant/dto/responses/restaurant.response';

@Injectable()
export class RestaurantCartService {
  constructor(
    private readonly addMealTransaction: AddMealRestaurantCartTransaction,
    @InjectRepository(RestaurantCart)
    private readonly restaurantCartRepository: Repository<RestaurantCart>,
    @InjectRepository(RestaurantCartMeal)
    private readonly restaurantCartMealRepository: Repository<RestaurantCartMeal>,
    @InjectRepository(RestaurantCartMealOption)
    private readonly restaurantCartMealOptionRepository: Repository<RestaurantCartMealOption>,
    @Inject(REQUEST) private readonly request: Request,
    private readonly updateMealRestaurantCartTransaction: UpdateMealRestaurantCartTransaction,
  ) {}

  async addMealToCart(req: AddMealRestaurantCartRequest) {
    return await this.addMealTransaction.run(req);
  }
  async getCartMeals() {
    const cart = await this.restaurantCartRepository.findOne({
      where: { user_id: this.request.user.id },
      relations: { restaurant_cart_meals:{meal:true,cart_meal_options:{option:true}} , restaurant: true },
    });
    if (!cart) return null;
    const response = plainToInstance(GetCartMealsResponse, cart.restaurant_cart_meals.map((m) => {const total_unit_price=Number(m.meal.price)+Number(m.cart_meal_options.reduce((acc,curr)=>acc+curr.option.price,0));return {...m.meal,meal_id:m.meal.id,id:m.id,quantity:m.quantity,total_price:total_unit_price}}), {
      excludeExtraneousValues: true,
    }); 
    const restaurant_respone= plainToInstance(RestaurantResponse, cart.restaurant,{excludeExtraneousValues:true});
    return {  meals: response,restaurant:restaurant_respone};
  }
  async clearCart() {
    const cart= await this.restaurantCartRepository.findOne({
     where:{ user_id: this.request.user.id},
    });
    const cart_items= await this.restaurantCartMealRepository.find({
      where:{cart_id:cart.id},
    });
 
 return    await this.restaurantCartMealRepository.remove(cart_items);
  }

  async deleteCartMeal(cart_meal_id: string) {
    return await this.restaurantCartMealRepository.delete({
      id: cart_meal_id,
    });
  } 
    async updateCartMeal(req: UpdateCartMealRequest) {
      return await this.updateMealRestaurantCartTransaction.run(req);
    }

  async getCartMealDetails(cart_meal_id:string){
    const cart_meal= await this.restaurantCartMealRepository.findOne({where:{id:cart_meal_id},relations:{meal:{meal_option_groups:{option_group:{options:true}}},cart_meal_options:{option:true}}});
   const response = plainToInstance(GetCartMealsResponse, {...cart_meal.meal,meal_id:cart_meal.meal.id,id:cart_meal.id,quantity:cart_meal.quantity,total_price:Number(cart_meal.meal.price)+ Number(cart_meal.cart_meal_options.reduce((acc,curr)=>acc+curr.option.price,0))}, { excludeExtraneousValues: true });
    //check if option is selected
    response.option_groups.forEach((option_group) => {
      option_group.options.forEach((option) => {
        option.is_selected=cart_meal.cart_meal_options.some(cart_meal_option=>cart_meal_option.option.id===option.id)
      });
    })
    return response
  }

  async getCartTotal() {
    const cart= await this.restaurantCartRepository.findOne({
      where:{ user_id: this.request.user.id},relations:{restaurant_cart_meals:{meal:true,cart_meal_options:{option:true}}}
    });

    const data= {meals_count:cart.restaurant_cart_meals.length,total_price:cart.restaurant_cart_meals.reduce((acc,curr)=>acc+(curr.quantity* curr.meal.price+curr.cart_meal_options.reduce((acc,curr)=>acc+curr.option.price,0)),0)};
    return data;
  }
  
}
