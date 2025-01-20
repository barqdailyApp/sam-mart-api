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
  ) {}

  async addMealToCart(req: AddMealRestaurantCartRequest) {
    return await this.addMealTransaction.run(req);
  }
  async getCartMeals() {
    const cart = await this.restaurantCartRepository.findOne({
      where: { user_id: this.request.user.id },
      relations: { restaurant_cart_meals:{meal:true,cart_meal_options:{option:true}} ,  },
    });
    const response = plainToInstance(GetCartMealsResponse, cart.restaurant_cart_meals.map((m) => {const total_unit_price=Number(m.meal.price)+Number(m.cart_meal_options.reduce((acc,curr)=>acc+curr.option.price,0));return {...m.meal,meal_id:m.meal.id,id:m.id,quantity:m.quantity,total_price:total_unit_price}}), {
      excludeExtraneousValues: true,
    }); 
    return response;
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
    const { cart_meal_id, quantity, options } = req;
  
    // Update meal quantity if provided
    if (quantity !== undefined) {
      await this.restaurantCartMealRepository.update(cart_meal_id, { quantity });
    }
  
    // Fetch the cart meal with necessary relations
    const cart_meal = await this.restaurantCartMealRepository.findOne({
      where: { id: cart_meal_id },
      relations: {
        meal: { meal_option_groups: { option_group: { options: true } } },
        cart_meal_options: { option: true },
      },
    });
  
    if (!cart_meal) {
      throw new BadRequestException('message.cart_meal_not_found');
    }
  
    for (const option_id of options || []) {
      // Check if the option exists in the meal options
      const option = cart_meal.meal.meal_option_groups
        .flatMap(meal_option_group => meal_option_group.option_group.options)
        .find(option => option.id === option_id);
  
      if (!option) {
        throw new BadRequestException(`message.option_not_found_in_meal_options: ${option_id}`);
      }
  
      const option_group = cart_meal.meal.meal_option_groups.find(
        meal_option_group => meal_option_group.option_group.options.find(option => option.id === option_id)
      );
  
      const cart_meal_options = cart_meal.cart_meal_options.filter(
        cart_meal_option => cart_meal_option.option.option_group_id === option_group.option_group.id  
      );
  
      const cart_meal_option = cart_meal_options.find(
        cart_meal_option => cart_meal_option.option.id === option_id
      );
  
      if (cart_meal_option) {
        // Validate minimum selection before removing
        if (cart_meal_options.length <= option_group.option_group.min_selection) {
          throw new BadRequestException('message.not_enough_options_in_cart');
        }
  
        // Remove the existing option
        await this.restaurantCartMealOptionRepository.delete({ id: cart_meal_option.id });
      } else {
        // Validate maximum selection before adding
        if (cart_meal_options.length >= option_group.option_group.max_selection) {
          throw new BadRequestException('message.too_many_options_in_cart');
        }
  
        // Add the new option
        await this.restaurantCartMealOptionRepository.save({
          cart_meal_id: cart_meal.id,
          option_id,
        });
      }
    }
  
    // Return the updated cart meal
    const updated_cart_meal= await this.restaurantCartMealRepository.findOne({
      where: { id: cart_meal_id },
      relations: {
        meal: { meal_option_groups: { option_group: { options: true } } },
        cart_meal_options: { option: true },
      },
    });
    const response= plainToInstance(GetCartMealsResponse,{...updated_cart_meal.meal,id:updated_cart_meal.id,meal_id:updated_cart_meal.meal.id,quantity:updated_cart_meal.quantity,total_price:Number(updated_cart_meal.meal.price)+ Number(updated_cart_meal.cart_meal_options.reduce((acc,curr)=>acc+curr.option.price,0))}, { excludeExtraneousValues: true });
    return response
  }

  async getCartMealDetails(cart_meal_id:string){
    const cart_meal= await this.restaurantCartMealRepository.findOne({where:{id:cart_meal_id},relations:{meal:{meal_option_groups:{option_group:{options:true}}},cart_meal_options:{option:true}}});
   const response = plainToInstance(GetCartMealsResponse, {...cart_meal.meal,meal_id:cart_meal.meal.id,quantity:cart_meal.quantity,total_price:Number(cart_meal.meal.price)+ Number(cart_meal.cart_meal_options.reduce((acc,curr)=>acc+curr.option.price,0))}, { excludeExtraneousValues: true });
    //check if option is selected
    response.option_groups.forEach((option_group) => {
      option_group.options.forEach((option) => {
        option.is_selected=cart_meal.cart_meal_options.some(cart_meal_option=>cart_meal_option.option.id===option.id)
      });
    })
    return response
  }
  
}
