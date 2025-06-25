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

  // the important thing here is to use the manager that we've created in the base class
  protected async execute(
    req: AddMealRestaurantCartRequest,
    context: EntityManager,
  ): Promise<GetCartMealsResponse> {
    try {
      const { meal_id, quantity, options_ids } = req;

      const user = await context.findOne(User, {
        where: { id: this.request.user.id },
      });

      // Find or create the user's cart
      let restaurant_cart = await context.findOne(RestaurantCart, {
        where: { user_id: this.request.user.id },
      });

      // Fetch the meal and check if it exists
      const meal = await context.findOne(Meal, {
        where: { id: meal_id },
        relations: { restaurant_category: { restaurant: true } },
      });
      if (!meal) throw new BadRequestException('message.meal_not_found');

      if (!restaurant_cart) {
        restaurant_cart = await context.save(RestaurantCart, {
          user: user,
          restaurant: meal.restaurant_category.restaurant,
        });
      } else {
        restaurant_cart.restaurant = meal.restaurant_category.restaurant;
        await context.save(restaurant_cart);
      }

      // Check if the meal belongs to another restaurant
      const is_another_cart = await context.findOne(RestaurantCartMeal, {
        where: {
          cart_id: restaurant_cart.id,
          meal: {
            restaurant_category: {
              restaurant: { id: Not(meal.restaurant_category.restaurant.id) },
            },
          },
        },
      });
      if (is_another_cart) return null;

      // Fetch all option groups for the meal
      const allOptionGroupsForMeal = await context.find(MealOptionGroup, {
        where: { meal_id: meal_id },
        relations: { option_group: { options: true } },
      });

      // Identify missing required groups
      const missingRequiredGroups = allOptionGroupsForMeal.filter(
        (group) =>
          group.option_group.min_selection > 0 &&
          !options_ids.some((option_id) =>
            group.option_group.options.some(
              (option) => option.id === option_id,
            ),
          ),
      );
      if (missingRequiredGroups.length > 0) {
        throw new BadRequestException('message.missing_required_options');
      }

      // Validate option group constraints
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

    // ابحث عن الوجبة الموجودة في السلة لنفس الوجبة والخيارات
const existingCartMeal = await context.findOne(RestaurantCartMeal, {
  where: {
    cart_id: restaurant_cart.id,
    meal_id: meal_id,
  },
  relations: {
    meal: true,
    cart_meal_options: { meal_option_price: { option: true } },
  },
});

if (existingCartMeal) {
  // استخرج كل option.id الموجودة في السلة
  const existingOptionIds = existingCartMeal.cart_meal_options
    .map((cart_meal_option) => cart_meal_option.meal_option_price?.option?.id)
    .filter(Boolean); // تجنب القيم null أو undefined

  // تحقق من التماثل التام بين الخيارات
  const areOptionsEqual =
    existingOptionIds.length === options_ids.length &&
    existingOptionIds.every((id) => options_ids.includes(id)) &&
    options_ids.every((id) => existingOptionIds.includes(id)); // تحقق مزدوج لمنع الأخطاء في الترتيب

  if (areOptionsEqual) {
    // 👈 هنا الكود الخاص بالتعامل مع الوجبة المكررة
  

          // If identical meal exists, update quantity
          existingCartMeal.quantity += quantity;
          await context.save(existingCartMeal);
          const response = plainToInstance(
            GetCartMealsResponse,
            {
              ...existingCartMeal.meal,
              price: Number(existingCartMeal.meal.price),
              meal_id: existingCartMeal.meal.id,
              quantity: existingCartMeal.quantity,
              total_price:
                Number(existingCartMeal.meal.price) +
                Number(
                  existingCartMeal.cart_meal_options.reduce(
                    (acc, curr) => acc + curr.meal_option_price?.price,
                    0,
                  ),
                ),
            },
            { excludeExtraneousValues: true },
          );
          return response;
        }
      }

      // Create a new cart meal entry
      const cart_meal = await context.save(RestaurantCartMeal, {
        cart_id: restaurant_cart.id,
        meal_id: meal_id,
        quantity: quantity,
        note: req.note,
      });

      //get options
      const meal_option_prices = await context.find(MealOptionPrice, {
        where: { meal_option_group: { meal_id: meal.id },option_id:In(options_ids) },
      });

      // Add options to the cart meal
      const cart_meal_options = meal_option_prices.map(
        (meal_option_price) =>
          new RestaurantCartMealOption({
            cart_meal_id: cart_meal.id,
            meal_option_price_id: meal_option_price.id,
          }),
      );

      await context.save(cart_meal_options);
      const cart_meal_with_options = await context.findOne(RestaurantCartMeal, {
        where: { id: cart_meal.id },
        relations: {
          meal: {
            offer: true,
            meal_option_groups: { meal_option_prices: { option: true },option_group: { options: true } },
          },
          cart_meal_options: {
            meal_option_price: { option: true, meal_option_group: true },
          }, // added meal_option_group relation here
        },
      });

      if (!cart_meal_with_options) {
        throw new BadRequestException('message.cart_meal_not_found');
      }

      const offer = cart_meal_with_options.meal.offer;

      const now = new Date(
        new Date().setUTCHours(new Date().getUTCHours() + 3),
      );

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
        Number(cart_meal_with_options.meal.price) *
        (1 - discount_percentage / 100);

      const options = (cart_meal_with_options.cart_meal_options || []).map(
        (o) => {
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
            price:Number( discounted_option_price),
            option_group: o.meal_option_price.option.option_group,
          };
        },
      );

      const totalOptionPrice = options.reduce(
        (acc, o) => acc + o.discounted_price,
        0,
      );
      const total_price = Number(
        (Number(discountedMealPrice) + Number(totalOptionPrice))) *
        Number(cart_meal_with_options.quantity);

      const response = plainToInstance(
        GetCartMealsResponse,
        {
          ...cart_meal_with_options.meal,
          price: Number(discountedMealPrice),
          id: cart_meal_with_options.id,
          quantity: cart_meal_with_options.quantity,
          total_price,
          cart_meal_options: options, // include options with prices if needed
        },
        { excludeExtraneousValues: true },
      );

      return response;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
