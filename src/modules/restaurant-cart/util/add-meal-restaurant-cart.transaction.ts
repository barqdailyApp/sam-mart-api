import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { REQUEST } from '@nestjs/core';
import { BaseTransaction } from 'src/core/base/database/base.transaction';
import { Restaurant } from 'src/infrastructure/entities/restaurant/restaurant.entity';
import { FileService } from 'src/modules/file/file.service';
import { RegisterRestaurantRequest } from 'src/modules/restaurant/dto/requests/register-restaurant.request';
import { DataSource, EntityManager, In, Not } from 'typeorm';
import { AddMealRestaurantCartRequest } from '../dto/request/add-meal-restaurant-cart.request';
import { RestaurantCart } from 'src/infrastructure/entities/restaurant/cart/restaurant-cart.entity';
import { Request } from 'express';
import { RestaurantCartMeal } from 'src/infrastructure/entities/restaurant/cart/restaurant-cart-meal.entity';
import { Meal } from 'src/infrastructure/entities/restaurant/meal/meal.entity';
import { MealOptionGroup } from 'src/infrastructure/entities/restaurant/meal/meal-option-group';
import { OptionGroup } from 'src/infrastructure/entities/restaurant/option/option-group.entity';
import { RestaurantCartMealOption } from 'src/infrastructure/entities/restaurant/cart/restaurant-cart-meal-option.entity';
import { plainToInstance } from 'class-transformer';
import { GetCartMealsResponse } from '../dto/response/get-cart-meals.response';
import { Option } from 'src/infrastructure/entities/restaurant/option/option.entity';
import { User } from 'src/infrastructure/entities/user/user.entity';
import { MealOptionPrice } from 'src/infrastructure/entities/restaurant/meal/meal-option-price.entity';

@Injectable()
export class AddMealRestaurantCartTransaction extends BaseTransaction<
  AddMealRestaurantCartRequest,
  GetCartMealsResponse
> {
  constructor(
    dataSource: DataSource,
    @Inject(REQUEST) readonly request: Request,
    private readonly fileService: FileService,
    @Inject(ConfigService) private readonly _config: ConfigService,
  ) {
    super(dataSource);
  }

  protected async execute(
    req: AddMealRestaurantCartRequest,
    context: EntityManager,
  ): Promise<GetCartMealsResponse> {
    try {
      const { meal_id, quantity, options_ids } = req;
      const userId = this.request.user.id;

      // 1. OPTIMIZATION: Single query to get all required data
      const initialData = await this.fetchInitialData(context, userId, meal_id);
      const { user, meal, restaurant_cart, allOptionGroupsForMeal } = initialData;

      // 2. Validate meal exists
      if (!meal) throw new BadRequestException('message.meal_not_found');

      // 3. OPTIMIZATION: Check cart restaurant conflict more efficiently
      if (restaurant_cart && await this.hasRestaurantConflict(context, restaurant_cart, meal)) {
        return null;
      }

      // 4. Create or update cart
      const cart = await this.ensureCart(context, user, meal, restaurant_cart);

      // 5. OPTIMIZATION: Validate options in single pass
      this.validateOptionGroups(allOptionGroupsForMeal, options_ids);

      // 6. OPTIMIZATION: Check for existing cart meal with batch query
      const existingCartMeal = await this.findExistingCartMeal(context, cart.id, meal_id, options_ids);

      if (existingCartMeal) {
        return await this.updateExistingCartMeal(context, existingCartMeal, quantity);
      }

      // 7. Create new cart meal
      return await this.createNewCartMeal(context, cart, meal, req, options_ids);

    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // OPTIMIZATION: Single query to fetch all initial required data
  private async fetchInitialData(context: EntityManager, userId: string, mealId: string) {
    const [user, meal, restaurant_cart, allOptionGroupsForMeal] = await Promise.all([
      // Get user
      context.findOne(User, { where: { id: userId } }),
      
      // Get meal with all required relations in one query
      context.findOne(Meal, {
        where: { id: mealId },
        relations: {
          restaurant_category: { restaurant: true },
          offer: true,
          meal_option_groups: {
            meal_option_prices: { option: true },
            option_group: { options: true }
          }
        }
      }),

      // Get cart
      context.findOne(RestaurantCart, {
        where: { user_id: userId },
        relations: { restaurant: true }
      }),

      // Get option groups
      context.find(MealOptionGroup, {
        where: { meal_id: mealId },
        relations: { option_group: { options: true } }
      })
    ]);

    return { user, meal, restaurant_cart, allOptionGroupsForMeal };
  }

  // OPTIMIZATION: More efficient restaurant conflict check
  private async hasRestaurantConflict(
    context: EntityManager, 
    cart: RestaurantCart, 
    meal: Meal
  ): Promise<boolean> {
    if (!cart.restaurant) return false;
    
    const mealRestaurantId = meal.restaurant_category.restaurant.id;
    
    // If cart is already for this restaurant, no conflict
    if (cart.restaurant.id === mealRestaurantId) return false;

    // Check if cart has meals from different restaurant
    const conflictCount = await context.count(RestaurantCartMeal, {
      where: { cart_id: cart.id }
    });

    return conflictCount > 0;
  }

  // OPTIMIZATION: Validate all option groups in single pass
  private validateOptionGroups(allOptionGroupsForMeal: MealOptionGroup[], options_ids: string[]) {
    for (const group of allOptionGroupsForMeal) {
      const providedOptions = group.option_group.options.filter(option =>
        options_ids.includes(option.id)
      );

      // Check minimum selection
      if (providedOptions.length < group.option_group.min_selection) {
        throw new BadRequestException('message.missing_required_options');
      }

      // Check maximum selection
      if (
        group.option_group.max_selection !== null &&
        providedOptions.length > group.option_group.max_selection
      ) {
        throw new BadRequestException('message.too_many_options');
      }
    }
  }

  private async ensureCart(
    context: EntityManager, 
    user: User, 
    meal: Meal, 
    existingCart?: RestaurantCart
  ): Promise<RestaurantCart> {
    if (!existingCart) {
      return await context.save(RestaurantCart, {
        user: user,
        restaurant: meal.restaurant_category.restaurant,
      });
    } else {
      existingCart.restaurant = meal.restaurant_category.restaurant;
      return await context.save(existingCart);
    }
  }

  // OPTIMIZATION: Single query to find existing cart meal with matching options
  private async findExistingCartMeal(
    context: EntityManager,
    cartId: string,
    mealId: string,
    optionIds: string[]
  ): Promise<RestaurantCartMeal | null> {
    const existingCartMeals = await context
      .createQueryBuilder(RestaurantCartMeal, 'cm')
      .leftJoinAndSelect('cm.meal', 'meal')
      .leftJoinAndSelect('cm.cart_meal_options', 'cmo')
      .leftJoinAndSelect('cmo.meal_option_price', 'mop')
      .leftJoinAndSelect('mop.option', 'option')
      .where('cm.cart_id = :cartId', { cartId })
      .andWhere('cm.meal_id = :mealId', { mealId })
      .getMany();

    return existingCartMeals.find(cartMeal => {
      const existingOptionIds = cartMeal.cart_meal_options.map(
        cmo => cmo.meal_option_price?.option?.id
      ).filter(Boolean);

      return (
        existingOptionIds.length === optionIds.length &&
        existingOptionIds.every(id => optionIds.includes(id))
      );
    }) || null;
  }

  private async updateExistingCartMeal(
    context: EntityManager,
    existingCartMeal: RestaurantCartMeal,
    quantity: number
  ): Promise<GetCartMealsResponse> {
    existingCartMeal.quantity += quantity;
    await context.save(existingCartMeal);

    const totalPrice = Number(existingCartMeal.meal.price) +
      existingCartMeal.cart_meal_options.reduce(
        (acc, curr) => acc + Number(curr.meal_option_price?.price || 0), 0
      );

    return plainToInstance(
      GetCartMealsResponse,
      {
        ...existingCartMeal.meal,
        price: Number(existingCartMeal.meal.price),
        id: existingCartMeal.id,
        meal_id: existingCartMeal.meal.id,
        quantity: existingCartMeal.quantity,
        total_price: totalPrice,
      },
      { excludeExtraneousValues: true }
    );
  }

  // OPTIMIZATION: Batch create cart meal and options
  private async createNewCartMeal(
    context: EntityManager,
    cart: RestaurantCart,
    meal: Meal,
    req: AddMealRestaurantCartRequest,
    optionIds: string[]
  ): Promise<GetCartMealsResponse> {
    // Create cart meal
    const cartMeal = await context.save(RestaurantCartMeal, {
      cart_id: cart.id,
      meal_id: meal.id,
      quantity: req.quantity,
      note: req.note,
      
    });

    // Get meal option prices in single query
    const mealOptionPrices = await context.find(MealOptionPrice, {
      where: {
        meal_option_group: { meal_id: meal.id },
        option_id: In(optionIds),
      },
      relations: {
        option: { option_group: true },
        meal_option_group: true
      }
    });

    // Batch create cart meal options
    if (mealOptionPrices.length > 0) {
      const cartMealOptions = mealOptionPrices.map(
        mop => new RestaurantCartMealOption({
          cart_meal_id: cartMeal.id,
          meal_option_price_id: mop.id,
        })
      );
      await context.save(cartMealOptions);
      
    }

    // Calculate pricing with offers
    return this.calculateFinalResponse(meal, cartMeal, mealOptionPrices);
  }

  private calculateFinalResponse(
    meal: Meal,
    cartMeal: RestaurantCartMeal,
    mealOptionPrices: MealOptionPrice[]
  ): GetCartMealsResponse {
    const offer = meal.offer;
    const now = new Date(new Date().setUTCHours(new Date().getUTCHours() + 3));
    
    const isOfferActive = offer?.is_active && 
      new Date(offer.start_date) <= now && 
      new Date(offer.end_date) > now;

    const discountPercentage = isOfferActive ? Number(offer.discount_percentage) : 0;
    const discountedMealPrice = Number(meal.price) * (1 - discountPercentage / 100);

    const totalOptionPrice = mealOptionPrices.reduce((acc, mop) => {
      const originalPrice = Number(mop.price);
      const shouldApplyDiscount = isOfferActive && mop.meal_option_group?.apply_offer;
      const discountedPrice = shouldApplyDiscount 
        ? originalPrice * (1 - discountPercentage / 100)
        : originalPrice;
      return acc + discountedPrice;
    }, 0);

    const totalPrice = (discountedMealPrice + totalOptionPrice) * cartMeal.quantity;
  const options = (mealOptionPrices|| []).map(o => {
      const originalPrice = Number(o.price || 0);
      const groupApplyOffer = o.meal_option_group?.apply_offer;
      
      const discountedPrice = (isOfferActive && groupApplyOffer)
        ? originalPrice * (1 - discountPercentage / 100)
        : originalPrice;

      return {
        ...o,
        original_price: originalPrice,
        discounted_price: discountedPrice,
        price: discountedPrice,
          option: o?.option,
        option_group: o?.option?.option_group
      };
    });
    return plainToInstance(
      GetCartMealsResponse,
      {
        ...meal,
        meal_id: meal.id,
        options: options,
        price: discountedMealPrice,
        id: cartMeal.id,
        quantity: cartMeal.quantity,
        total_price: totalPrice,
      },
      { excludeExtraneousValues: true }
    );
  }
}