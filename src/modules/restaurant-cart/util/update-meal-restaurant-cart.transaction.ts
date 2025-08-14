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

      // OPTIMIZATION 1: Single query to get cart meal with all required relations
      const cartMeal = await context.findOne(RestaurantCartMeal, {
        where: { id: cart_meal_id },
        relations: {
          cart_meal_options: {
            meal_option_price: {
              option: { option_group: true },
              meal_option_group: true
            }
          },
          meal: {
            offer: true,
            meal_option_groups: {
              option_group: { options: true },
              meal_option_prices: { option: true }
            }
          }
        }
      });

      if (!cartMeal) {
        throw new BadRequestException('message.cart_meal_not_found');
      }

      // OPTIMIZATION 2: Update quantity immediately (no need to wait)
      if (cartMeal.quantity !== quantity) {
        cartMeal.quantity = quantity;
        await context.save(cartMeal);
      }

      // OPTIMIZATION 3: Handle options update efficiently
      if (edit_options) {
        await this.updateCartMealOptions(context, cartMeal, options_ids);
      }

      // OPTIMIZATION 4: Calculate response using existing data (no re-fetch needed)
      return this.buildResponse(cartMeal);

    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // OPTIMIZATION: Efficient options update with batch operations
  private async updateCartMealOptions(
    context: EntityManager,
    cartMeal: RestaurantCartMeal,
    options_ids?: string[]
  ): Promise<void> {
    const uniqueOptionIds = options_ids ? [...new Set(options_ids)] : [];

    // OPTIMIZATION: Parallel delete and fetch operations
    const [, availableMealOptionPrices, allOptionGroups] = await Promise.all([
      // Delete existing options
      context.delete(RestaurantCartMealOption, {
        cart_meal_id: cartMeal.id
      }),

      // Get available meal option prices for the new options
      uniqueOptionIds.length > 0 
        ? context.find(MealOptionPrice, {
            where: {
              option_id: In(uniqueOptionIds),
              meal_option_group: { meal_id: cartMeal.meal.id }
            },
            relations: {
              option: { option_group: true },
              meal_option_group: true
            }
          })
        : Promise.resolve([]),

      // Get all option groups for validation (reuse existing data if available)
      cartMeal.meal.meal_option_groups?.length > 0
        ? Promise.resolve(cartMeal.meal.meal_option_groups)
        : context.find(MealOptionGroup, {
            where: { meal_id: cartMeal.meal.id },
            relations: { option_group: { options: true } }
          })
    ]);

    // OPTIMIZATION: Validate options before creating (fail fast)
    if (uniqueOptionIds.length > 0) {
      this.validateOptionGroups(allOptionGroups, uniqueOptionIds);
    }

    // OPTIMIZATION: Batch create new cart meal options
    if (availableMealOptionPrices.length > 0) {
      const newCartMealOptions = availableMealOptionPrices.map(mp =>
        new RestaurantCartMealOption({
          cart_meal_id: cartMeal.id,
          meal_option_price_id: mp.id
        })
      );

      await context.save(newCartMealOptions);

      // Update the cartMeal object with new options for response calculation
      cartMeal.cart_meal_options = newCartMealOptions.map(option => ({
        ...option,
        meal_option_price: availableMealOptionPrices.find(mp => mp.id === option.meal_option_price_id)
      })) as any;
    } else {
      cartMeal.cart_meal_options = [];
    }
  }

  // OPTIMIZATION: Validate options in single pass (reuse from previous optimization)
  private validateOptionGroups(allOptionGroups: MealOptionGroup[], optionIds: string[]): void {
    for (const group of allOptionGroups) {
      const selectedOptions = group.option_group.options.filter(opt =>
        optionIds.includes(opt.id)
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

  // OPTIMIZATION: Build response without additional database queries
  private buildResponse(cartMeal: RestaurantCartMeal): GetCartMealsResponse {
    const offer = cartMeal.meal.offer;
    const now = new Date(new Date().setUTCHours(new Date().getUTCHours() + 3));

    const isOfferActive = offer?.is_active &&
      new Date(offer.start_date) <= now &&
      new Date(offer.end_date) > now;

    const discountPercentage = isOfferActive ? Number(offer.discount_percentage) : 0;
    const discountedMealPrice = Number(cartMeal.meal.price) * (1 - discountPercentage / 100);

    // Process options with pricing
    const options = (cartMeal.cart_meal_options || []).map(o => {
      const originalPrice = Number(o.meal_option_price?.price || 0);
      const groupApplyOffer = o.meal_option_price?.meal_option_group?.apply_offer;
      
      const discountedPrice = (isOfferActive && groupApplyOffer)
        ? originalPrice * (1 - discountPercentage / 100)
        : originalPrice;

      return {
        ...o,
        original_price: originalPrice,
        discounted_price: discountedPrice,
        price: discountedPrice,
          option: o.meal_option_price.option,
        option_group: o.meal_option_price?.option?.option_group
      };
    });

    const totalOptionPrice = options.reduce((acc, o) => acc + o.discounted_price, 0);
    const totalPrice = (discountedMealPrice + totalOptionPrice) * cartMeal.quantity;

    return plainToInstance(
      GetCartMealsResponse,
      {
        ...cartMeal.meal,
        id: cartMeal.id,
        meal_id: cartMeal.meal.id,
        price: discountedMealPrice,
        quantity: cartMeal.quantity,
        total_price: totalPrice,
        options: options,
        // cart_meal_options: options
      },
      { excludeExtraneousValues: true }
    );
  }
}

// ADDITIONAL OPTIMIZATION: Create a specialized query for bulk updates if needed
export class BulkUpdateCartTransaction {
  // For updating multiple cart items at once - reduces transaction overhead
  static async updateMultipleCartMeals(
    context: EntityManager,
    updates: Array<{ cart_meal_id: string; quantity: number; options_ids?: string[] }>
  ): Promise<void> {
    // Batch update quantities
    for (const update of updates) {
      await context.update(
        RestaurantCartMeal,
        { id: update.cart_meal_id },
        { quantity: update.quantity }
      );
    }

    // Batch update options if needed
    // Implementation would depend on specific requirements
  }
}