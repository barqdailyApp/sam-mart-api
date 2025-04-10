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
import { Address } from 'src/infrastructure/entities/user/address.entity';
import { Constant } from 'src/infrastructure/entities/constant/constant.entity';
import { ConstantType } from 'src/infrastructure/data/enums/constant-type.enum';
import { calculateDistances } from 'src/core/helpers/geom.helper';

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
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    @InjectRepository(Constant)
    private readonly constantRepository: Repository<Constant>,
  ) {}

  async addMealToCart(req: AddMealRestaurantCartRequest) {
    return await this.addMealTransaction.run(req);
  }
  async getCartMeals() {
    const cart = await this.restaurantCartRepository.findOne({
      where: { user_id: this.request.user.id },
      relations: {
        restaurant_cart_meals: {
          meal: {offer:true},
          cart_meal_options: { option: {option_group:true} },
        },
        restaurant: true,
      },
    });
    const default_address = await this.addressRepository.findOne({
      where: { user_id: this.request.user.id, is_favorite: true },
    });
    const settings = await this.constantRepository.find();
    const fixed_delivery_fee = settings.find(
      (s) => s.type === ConstantType.FIXED_DELIVERY_FEE,
    ).variable;
    const delivery_price_per_km = settings.find(
      (s) => s.type === ConstantType.DELIVERY_PRICE_PER_KM,
    ).variable;
    const fixed_delivery_distance = settings.find(
      (s) => s.type === ConstantType.FREE_DELIVERY_DISTANCE,
    ).variable;
    const distance = calculateDistances(
      [cart.restaurant.latitude, cart.restaurant.longitude],
      [default_address.latitude, default_address.longitude],
    );
    const delivery_fee =
      Number(fixed_delivery_fee) +
      (Number(distance) - Number(fixed_delivery_distance) < 0
        ? 0
        : Number(distance) - Number(fixed_delivery_distance)) *
        Number(delivery_price_per_km);

    if (!cart) return null;
    
    const response = plainToInstance(
      GetCartMealsResponse,
      cart.restaurant_cart_meals.map((m) => {
        // Check if the meal has a valid offer
        const offer = m.meal.offer;
        let discount_percentage = 0;
        let discounted_price = Number(m.meal.price);
    
        if (
          offer &&
          offer.is_active &&
          new Date(offer.start_date) <= new Date(new Date().setUTCHours(new Date().getUTCHours() + 3)) && // Yemen Time (UTC+3)
          new Date(offer.end_date) > new Date(new Date().setUTCHours(new Date().getUTCHours() + 3))
        ) {
          discount_percentage = Number(offer.discount_percentage);
          discounted_price = discounted_price - (discounted_price * discount_percentage) / 100;
        }
    
        // Calculate total unit price with options
        const total_unit_price =
          discounted_price +
          Number(
            m.cart_meal_options.reduce(
              (acc, curr) => acc + curr.option.price,
              0,
            ),
          );
    
        return {
          ...m.meal,
          meal_id: m.meal.id,
          id: m.id,
          quantity: m.quantity,
          total_price: total_unit_price , // Multiply by quantity for final total
          options: m.cart_meal_options.map((o) => ({
            ...o,
            price: o.option.price,
            option_group: o.option.option_group,
          })),
         
        
        };
      }),
      {
        excludeExtraneousValues: true,
      },
    );
    
    const restaurant_respone = plainToInstance(
      RestaurantResponse,
      cart.restaurant,
      { excludeExtraneousValues: true },
    );
    return {
      meals: response,
      restaurant: restaurant_respone,
      delivery_fee: delivery_fee,
    };
  }
  async clearCart() {
    const cart = await this.restaurantCartRepository.findOne({
      where: { user_id: this.request.user.id },
    });
    const cart_items = await this.restaurantCartMealRepository.find({
      where: { cart_id: cart.id },
    });

    return await this.restaurantCartMealRepository.remove(cart_items);
  }

  async deleteCartMeal(cart_meal_id: string) {
    return await this.restaurantCartMealRepository.delete({
      id: cart_meal_id,
    });
  }
  async updateCartMeal(req: UpdateCartMealRequest) {
    const response = await this.updateMealRestaurantCartTransaction.run(req);
    const cart_meals = this.getCartMeals();
    return (await cart_meals).meals.find(
      (cart_meal) => cart_meal.id === response.id,
    );
  }

  async getCartMealDetails(cart_meal_id: string) {
    const cart_meal = await this.restaurantCartMealRepository.findOne({
      where: { id: cart_meal_id },
      relations: {
        meal: { meal_option_groups: { option_group: { options: true } } },
        cart_meal_options: { option: true },
      },
    });
    const response = plainToInstance(
      GetCartMealsResponse,
      {
        ...cart_meal.meal,
        meal_id: cart_meal.meal.id,
        id: cart_meal.id,
        quantity: cart_meal.quantity,
        total_price:
          Number(cart_meal.meal.price) +
          Number(
            cart_meal.cart_meal_options.reduce(
              (acc, curr) => acc + curr.option.price,
              0,
            ),
          ),
      },
      { excludeExtraneousValues: true },
    );
    //check if option is selected
    response.option_groups.forEach((option_group) => {
      option_group.options.forEach((option) => {
        option.is_selected = cart_meal.cart_meal_options.some(
          (cart_meal_option) => cart_meal_option.option.id === option.id,
        );
      });
    });
    return response;
  }

  async getCartTotal() {
    const cart = await this.restaurantCartRepository.findOne({
      where: { user_id: this.request.user.id },
      relations: {
        restaurant_cart_meals: {
          meal: true,
          cart_meal_options: { option: true },
        },
      },
    });

    const data = {
      meals_count: cart.restaurant_cart_meals.length,
      total_price: cart.restaurant_cart_meals.reduce(
        (acc, curr) =>
          acc +
          (curr.quantity * curr.meal.price +
            curr.cart_meal_options.reduce(
              (acc, curr) => acc + curr.option.price,
              0,
            )),
        0,
      ),
    };
    return data;
  }
}
