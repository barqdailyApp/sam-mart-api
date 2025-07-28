import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { REQUEST } from '@nestjs/core';
import { BaseTransaction } from 'src/core/base/database/base.transaction';
import { RestaurantCartMealOption } from 'src/infrastructure/entities/restaurant/cart/restaurant-cart-meal-option.entity';
import { RestaurantCartMeal } from 'src/infrastructure/entities/restaurant/cart/restaurant-cart-meal.entity';
import { MealOptionGroup } from 'src/infrastructure/entities/restaurant/meal/meal-option-group';
import { Meal } from 'src/infrastructure/entities/restaurant/meal/meal.entity';
import { DataSource, EntityManager, In } from 'typeorm';

import { GetCartMealsResponse } from '../dto/response/get-cart-meals.response';
import { plainToInstance } from 'class-transformer';
import { Request } from 'express';
import { UpdateCartMealRequest } from '../dto/request/update-cart-item.request';
import { MealOptionPrice } from 'src/infrastructure/entities/restaurant/meal/meal-option-price.entity';

@Injectable()
export class UpdateMealRestaurantCartTransaction extends BaseTransaction<
  UpdateCartMealRequest,
  GetCartMealsResponse
> {
  constructor(
    dataSource: DataSource,
    @Inject(REQUEST) readonly request: Request,
    @Inject(ConfigService) private readonly _config: ConfigService,
  ) {
    super(dataSource);
  }

  protected async execute(
    req: UpdateCartMealRequest,
    context: EntityManager,
  ): Promise<GetCartMealsResponse> {
    try {
      const { cart_meal_id, quantity, options_ids, edit_options } = req;

      const cartMeal = await context.findOne(RestaurantCartMeal, {
        where: { id: cart_meal_id },
        relations: {
          cart_meal_options: true,
          meal: { meal_option_groups: { option_group: { options: true } } },
        },
      });

      if (!cartMeal) {
        throw new BadRequestException('message.cart_meal_not_found');
      }

      const meal = await context.findOne(Meal, {
        where: { id: cartMeal.meal.id },
        relations: { meal_option_groups: { option_group: { options: true } } },
      });

      if (!meal) {
        throw new BadRequestException('message.meal_not_found');
      }

      // Uncomment this section if you want to enforce restaurant match validation
      // if (
      //   cartMeal.meal.restaurant_category.restaurant.id !==
      //   meal.restaurant_category.restaurant.id
      // ) {
      //   throw new BadRequestException('message.invalid_meal_for_cart');
      // }

    if (edit_options) {
  // Delete previous options for this cart meal
  await context.delete(RestaurantCartMealOption, {
    cart_meal_id: cartMeal.id,
  });

  if (options_ids?.length) {
    // Get unique option IDs only
    const uniqueOptionIds = [...new Set(options_ids)];

    // Load corresponding MealOptionPrice records
    const meal_option_prices = await context.find(MealOptionPrice, {
      where: { option_id: In(uniqueOptionIds) },
    });

    // Map and save new cart meal options
    const newCartMealOptions = meal_option_prices.map(mp => {
      return new RestaurantCartMealOption({
        cart_meal: cartMeal,
        meal_option_price: mp,
      });
    });

    await context.save(newCartMealOptions);

    // Validate options per group
    const allOptionGroupsForMeal = await context.find(MealOptionGroup, {
      where: { meal_id: meal.id },
      relations: { option_group: { options: true } },
    });

    for (const group of allOptionGroupsForMeal) {
      const selectedOptions = group.option_group.options.filter((opt) =>
        uniqueOptionIds.includes(opt.id),
      );

      if (selectedOptions.length < group.option_group.min_selection) {
        throw new BadRequestException('message.missing_required_options');
      }

      if (
        group.option_group.max_selection !== null &&
        selectedOptions.length > group.option_group.max_selection
      ) {
        throw new BadRequestException('message.too_many_options');
      }
    }
  }
}

      // Update quantity
      cartMeal.quantity = quantity;
      delete cartMeal.cart_meal_options;
      await context.save(cartMeal);

      // Re-fetch with new options and prices
      const updatedCartMeal = await context.findOne(RestaurantCartMeal, {
        where: { id: cartMeal.id },
        relations: {
          cart_meal_options: { meal_option_price: {option:{option_group:true}} },
          meal: {
            offer: true,
            meal_option_groups: { option_group: { options: true } },
          },
        },
      });

      // After re-fetching updatedCartMeal with relations (including offer)

      const offer = updatedCartMeal.meal.offer;

      const now = new Date(
        new Date().setUTCHours(new Date().getUTCHours() + 3),
      ); // Adjusted time for your timezone

      const isOfferActive =
        offer &&
        offer.is_active &&
        new Date(offer.start_date) <= now &&
        new Date(offer.end_date) > now;

      let discount_percentage = 0;

      if (isOfferActive) {
        discount_percentage = Number(offer.discount_percentage);
      }

      const discountedMealPrice =
        Number(updatedCartMeal.meal.price) * (1 - discount_percentage / 100);

      const options = (updatedCartMeal.cart_meal_options || []).map((o) => {
        const original_price = o.meal_option_price.price;
        let discounted_option_price = original_price;

        const group_apply_offer =
          o.meal_option_price.meal_option_group?.apply_offer;

        if (isOfferActive && group_apply_offer) {
          discounted_option_price =
            original_price * (1 - discount_percentage / 100);
        }

        return {
          ...o,
          original_price,
          discounted_price: discounted_option_price,
          price: discounted_option_price,
          option_group: o.meal_option_price.option.option_group,
        };
      });

      // Sum all option prices
      const totalOptionPrice = options.reduce(
        (acc, o) => acc + o.discounted_price,
        0,
      );

      const total_price =
        (discountedMealPrice + totalOptionPrice) * updatedCartMeal.quantity;

      const response = plainToInstance(
        GetCartMealsResponse,
        {
          ...updatedCartMeal.meal,
          id: updatedCartMeal.id,
          quantity: updatedCartMeal.quantity,
          total_price,
          cart_meal_options: options, // optionally include options with prices if needed in response
        },
        { excludeExtraneousValues: true },
      );

      return response;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
