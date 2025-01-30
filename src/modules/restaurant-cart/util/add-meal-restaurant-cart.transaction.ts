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
import { User } from 'src/infrastructure/entities/user/user.entity';
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
        })
        
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
        }
        else {
          restaurant_cart.restaurant = meal.restaurant_category.restaurant;
          await context.save(restaurant_cart);
        }
    
     
        // Check if the meal belongs to another restaurant
        const is_another_cart = await context.findOne(RestaurantCartMeal, {
          where: {
            cart_id: restaurant_cart.id,
            meal: { restaurant_category: { restaurant: { id: Not(meal.restaurant_category.restaurant.id) } } },
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
              group.option_group.options.some((option) => option.id === option_id)
            )
        );
        if (missingRequiredGroups.length > 0) {
          throw new BadRequestException('message.missing_required_options');
        }
    
        // Validate option group constraints
        for (const group of allOptionGroupsForMeal) {
          const providedOptions = group.option_group.options.filter((option) =>
            options_ids.includes(option.id)
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
    
        // Check if the meal with the same options already exists in the cart
        const existingCartMeal = await context.findOne(RestaurantCartMeal, {
          where: {
            cart_id: restaurant_cart.id,
            meal_id: meal_id,

          },
          relations: { meal: true,cart_meal_options: {option:true} },
        });
    
        if (existingCartMeal) {
          const existingOptionIds = existingCartMeal.cart_meal_options.map(
            (cart_meal_option) => cart_meal_option.option_id
          );
    
          if (
            existingOptionIds.length === options_ids.length &&
            existingOptionIds.every((id) => options_ids.includes(id))
          ) {
            // If identical meal exists, update quantity
            existingCartMeal.quantity += quantity;
            await context.save(existingCartMeal);
            const response = plainToInstance(GetCartMealsResponse, {...existingCartMeal.meal,meal_id:existingCartMeal.meal.id,quantity:existingCartMeal.quantity,total_price:Number(existingCartMeal.meal.price)+ Number(existingCartMeal.cart_meal_options.reduce((acc,curr)=>acc+curr.option.price,0))}, { excludeExtraneousValues: true });
            return response;
          }
        }
    
        // Create a new cart meal entry
        const cart_meal = await context.save(RestaurantCartMeal, {
          cart_id: restaurant_cart.id,
          meal_id: meal_id,
          quantity: quantity,
        });
    
        // Add options to the cart meal
        const cart_meal_options = options_ids.map((option_id) =>
          new RestaurantCartMealOption({ cart_meal_id: cart_meal.id, option_id })
        );
        await context.save(cart_meal_options);
        const cart_meal_with_options = await context.findOne(RestaurantCartMeal, {
          where: { id: cart_meal.id },
          relations: {meal: { meal_option_groups: { option_group: { options: true } }}, cart_meal_options: { option: true } },
        })
        const response= plainToInstance(GetCartMealsResponse, {...cart_meal_with_options.meal,id:cart_meal_with_options.meal.id,quantity:cart_meal_with_options.quantity,total_price:Number(cart_meal_with_options.meal.price)+ Number(cart_meal_with_options.cart_meal_options.reduce((acc,curr)=>acc+curr.option.price,0))}, { excludeExtraneousValues: true });
    
        return response;
      } catch (error) {
        throw new BadRequestException(error.message);
      }
    }
    
  }

