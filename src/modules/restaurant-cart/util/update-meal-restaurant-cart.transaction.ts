import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { REQUEST } from '@nestjs/core';
import { BaseTransaction } from 'src/core/base/database/base.transaction';
import { RestaurantCartMealOption } from 'src/infrastructure/entities/restaurant/cart/restaurant-cart-meal-option.entity';
import { RestaurantCartMeal } from 'src/infrastructure/entities/restaurant/cart/restaurant-cart-meal.entity';
import { MealOptionGroup } from 'src/infrastructure/entities/restaurant/meal/meal-option-group';
import { Meal } from 'src/infrastructure/entities/restaurant/meal/meal.entity';
import { DataSource, EntityManager, Not } from 'typeorm';

import { GetCartMealsResponse } from '../dto/response/get-cart-meals.response';
import { plainToInstance } from 'class-transformer';
import { Request } from 'express';
import { UpdateCartMealRequest } from '../dto/request/update-cart-item.request';

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

      // Fetch the cart meal to be updated
      const cartMeal = await context.findOne(RestaurantCartMeal, {
        where: {
          id: cart_meal_id,
        },
        relations: {
          cart_meal_options: true,
          meal: { meal_option_groups: { option_group: { options: true } } },
        },
      });

      if (!cartMeal) throw new BadRequestException('message.cart_meal_not_found');

      const meal = await context.findOne(Meal, {
        where: { id: cartMeal.meal.id },
        relations: { meal_option_groups: { option_group: { options: true } } },
      });

      if (!meal) throw new BadRequestException('message.meal_not_found');

      // // Validate that the meal belongs to the correct restaurant
      // if (
      //   cartMeal.meal.restaurant_category.restaurant.id !==
      //   meal.restaurant_category.restaurant.id
      // ) {
      //   throw new BadRequestException('message.invalid_meal_for_cart');
      // }

      if (edit_options==true)  {
        // Remove existing options
        await context.delete(RestaurantCartMealOption, {
          cart_meal_id: cartMeal.id,
        });

        // Add new options if provided
        if (options_ids && options_ids.length > 0) {
          const newCartMealOptions = options_ids.map((option_id) =>
            new RestaurantCartMealOption({ cart_meal_id: cartMeal.id, option_id }),
          );
          await context.save(newCartMealOptions);

          // Validate new options
          const allOptionGroupsForMeal = await context.find(MealOptionGroup, {
            where: { meal_id: cartMeal.meal.id },
            relations: { option_group: { options: true } },
          });

          const missingRequiredGroups = allOptionGroupsForMeal.filter(
            (group) =>
              group.option_group.min_selection > 0 &&
              !options_ids.some((option_id) =>
                group.option_group.options.some((option) => option.id === option_id),
              ),
          );

          if (missingRequiredGroups.length > 0) {
            throw new BadRequestException('message.missing_required_options');
          }

          for (const group of allOptionGroupsForMeal) {
            const providedOptions = group.option_group.options.filter((option) =>
              options_ids.includes(option.id),
            );

            if (providedOptions.length < group.option_group.min_selection) {
              throw new BadRequestException('message.missing_required_options');
            }
            if (
              group.option_group.max_selection !== null &&
              providedOptions.length > group.option_group.max_selection
            ) {
              throw new BadRequestException('message.too_many_options');
            }
          }
        }
      }

      // Update the quantity
      cartMeal.quantity = quantity;
      await context.save(cartMeal);

      // Calculate total price and create response
      const total_price =
        Number(cartMeal.meal.price) +
        (cartMeal.cart_meal_options || []).reduce((acc, curr) => acc + curr.option?.price||0, 0);

      const response = plainToInstance(
        GetCartMealsResponse,
        {
          ...cartMeal.meal,
          id: cartMeal.meal.id,
          quantity: cartMeal.quantity,
          total_price,
        },
        { excludeExtraneousValues: true },
      );

      return response;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
