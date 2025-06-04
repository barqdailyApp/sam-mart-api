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
import { TransactionService } from '../transaction/transaction.service';
import { or } from 'sequelize';

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
    @Inject(TransactionService)
    private readonly transactionService: TransactionService,
  ) {}

  async addMealToCart(req: AddMealRestaurantCartRequest) {
    return await this.addMealTransaction.run(req);
  }

  async getCartMeals() {
    const cart = await this.restaurantCartRepository.findOne({
      where: { user_id: this.request.user.id },
      relations: {
        restaurant_cart_meals: {
          meal: { offer: true },
          cart_meal_options: {
            meal_option_price: {
              meal_option_group: true,
              option: { option_group: true },
            },
          },
        },
        restaurant: true,
      },
    });

    if (!cart) return null;

    for (let i = cart.restaurant_cart_meals?.length - 1; i >= 0; i--) {
      if (!cart.restaurant_cart_meals[i]?.meal?.is_active) {
        await this.restaurantCartMealRepository.delete({
          id: cart?.restaurant_cart_meals[i]?.id,
        });
      }
    }

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

    const response = plainToInstance(
      GetCartMealsResponse,
      cart.restaurant_cart_meals.map((m) => {
        const offer = m.meal.offer;
        let discount_percentage = 0;
        let discounted_price = Number(m.meal.price);
        let price= Number(m.meal.price);
        const isOfferActive =
          offer &&
          offer.is_active &&
          new Date(offer.start_date) <=
            new Date(new Date().setUTCHours(new Date().getUTCHours() + 3)) &&
          new Date(offer.end_date) >
            new Date(new Date().setUTCHours(new Date().getUTCHours() + 3));

        if (isOfferActive) {
          discount_percentage = Number(offer.discount_percentage);
          discounted_price =
            discounted_price - (Number(discounted_price) * Number( discount_percentage)) / 100;
        }

        const options = m.cart_meal_options.map((o) => {
          const original_price = Number(o.meal_option_price.price);
          let discounted_option_price = original_price;

          const group_apply_offer =
            o.meal_option_price.meal_option_group?.apply_offer;

          if (isOfferActive && group_apply_offer) {
            discounted_option_price =
              original_price - (original_price * discount_percentage) / 100;
          }

          return {
            ...o,
            original_price,
            discounted_price: discounted_option_price,
            price: discounted_option_price,
            option: o.meal_option_price.option,

            option_group: o.meal_option_price.option.option_group,
          };
        });

        const total_unit_price =
          discounted_price +
          Number(options.reduce((acc, o) => acc + o.discounted_price, 0));
          price = price + Number(options.reduce((acc, o) => acc + o.original_price, 0));

        return {
          ...m.meal,
          price,
          meal_id: m.meal.id,
          id: m.id,
          quantity: m.quantity,
          total_price: total_unit_price,
          options,
        };
      }),
      { excludeExtraneousValues: true },
    );

    const restaurant_response = plainToInstance(
      RestaurantResponse,
      cart.restaurant,
      { excludeExtraneousValues: true },
    );

    return {
      meals: response,
      restaurant: restaurant_response,
      delivery_fee: delivery_fee,
      wallet: await this.transactionService.getWallet(this.request.user.id),
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
    return await this.restaurantCartMealRepository.delete({ id: cart_meal_id });
  }

  async updateCartMeal(req: UpdateCartMealRequest) {
    const response = await this.updateMealRestaurantCartTransaction.run(req);
    const cart_meals = await this.getCartMeals();
    return cart_meals.meals.find((cart_meal) => cart_meal.id === response.id);
  }

  async getCartMealDetails(cart_meal_id: string) {
    const cart_meal = await this.restaurantCartMealRepository.findOne({
      where: { id: cart_meal_id },
      relations: {
        meal: {
          meal_option_groups: {
            meal_option_prices: { option: true },
            option_group: { options: true },
          },
          offer: true,
        },
        cart_meal_options: {
          meal_option_price: { option: true, meal_option_group: true },
        },
      },
    });

    const offer = cart_meal.meal.offer;
    const now = new Date(new Date().setUTCHours(new Date().getUTCHours() + 3));
    const isOfferActive =
      offer &&
      offer.is_active &&
      new Date(offer.start_date) <= now &&
      new Date(offer.end_date) > now;

    const discount_percentage = isOfferActive
      ? Number(offer.discount_percentage)
      : 0;
    let discounted_meal_price = cart_meal.meal.price;

    if (isOfferActive) {
      discounted_meal_price -=
        (discounted_meal_price * discount_percentage) / 100;
    }

    const options = cart_meal.cart_meal_options.map((opt) => {
      const original_price = opt.meal_option_price?.price;
      let final_price = original_price;

      if (
        isOfferActive &&
        opt.meal_option_price.meal_option_group?.apply_offer
      ) {
        final_price -= (final_price * discount_percentage) / 100;
      }

      return {
        ...opt,
        price: final_price,
      };
    });

    const total_price =
      Number(discounted_meal_price) +
      Number(options.reduce((acc, opt) => acc + opt.price, 0));

    const response = plainToInstance(
      GetCartMealsResponse,
      {
        ...cart_meal.meal,
        meal_id: cart_meal.meal.id,
        id: cart_meal.id,
        quantity: cart_meal.quantity,
        total_price: total_price,
      },
      { excludeExtraneousValues: true },
    );
    console.log(
      cart_meal.cart_meal_options.map((o) => o.meal_option_price.option_id),
    );
    response?.option_groups?.forEach((option_group) => {
      option_group?.options?.forEach((option) => {
        console.log('option', option.option_id);
        option.is_selected = cart_meal.cart_meal_options.some(
          (cart_meal_option) =>
            cart_meal_option.meal_option_price.option.id == option.id,
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
          meal: { offer: true },
          cart_meal_options: {
            meal_option_price: {
              meal_option_group: true,
              option: true,
            },
          },
        },
      },
    });

    if (!cart) {
      return { meals_count: 0, total_price: 0 };
    }

    const now = new Date(new Date().setUTCHours(new Date().getUTCHours() + 3));

    const total_price = cart.restaurant_cart_meals.reduce((acc, cartMeal) => {
      let mealPrice = Number(cartMeal.meal.price);
      const offer = cartMeal.meal.offer;
      let discount = 0;

      if (
        offer &&
        offer.is_active &&
        new Date(offer.start_date) <= now &&
        new Date(offer.end_date) > now
      ) {
        discount = Number(offer.discount_percentage);
        mealPrice = mealPrice - (mealPrice * discount) / 100;
      }

      const optionsTotal = cartMeal.cart_meal_options.reduce((optAcc, opt) => {
        let optionPrice =Number( opt.meal_option_price.price);

        if (
          discount > 0 &&
          opt.meal_option_price.meal_option_group?.apply_offer
        ) {
          optionPrice -= (optionPrice * discount) / 100;
        }

        return optAcc + optionPrice;
      }, 0);

      return (
        Number(acc) +
        cartMeal.quantity * Number(Number(mealPrice) + Number(optionsTotal))
      );
    }, 0);

    return {
      meals_count: cart.restaurant_cart_meals.length,
      total_price,
    };
  }
}
