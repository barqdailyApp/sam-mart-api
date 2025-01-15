import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { REQUEST } from '@nestjs/core';
import { BaseTransaction } from 'src/core/base/database/base.transaction';
import { Restaurant } from 'src/infrastructure/entities/restaurant/restaurant.entity';
import { FileService } from 'src/modules/file/file.service';
import { RegisterRestaurantRequest } from 'src/modules/restaurant/dto/requests/register-restaurant.request';
import { DataSource, EntityManager, In, Not } from 'typeorm';
import { AddMealRestaurantCartRequest } from '../dto/request/add-meal-restaurant-cart.request';
import { RestaurantCart } from 'src/infrastructure/entities/restaurant/restaurant-cart.entity';
import { Request } from 'express';
import { RestaurantCartMeal } from 'src/infrastructure/entities/restaurant/restaurant-cart-meal.entity';
import { Meal } from 'src/infrastructure/entities/restaurant/meal.entity';
import { MealOptionGroup } from 'src/infrastructure/entities/restaurant/meal-option-group';
import { OptionGroup } from 'src/infrastructure/entities/restaurant/option-group.entity';
import { RestaurantCartMealOption } from 'src/infrastructure/entities/restaurant/restaurant-cart-meal-option.entity';
import { plainToInstance } from 'class-transformer';
@Injectable()
export class AddMealRestaurantCartTransaction extends BaseTransaction<
  AddMealRestaurantCartRequest,
  RestaurantCartMeal
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
  ): Promise<RestaurantCartMeal> {
    try {
      let restaurant_cart = await context.findOne(RestaurantCart, {
        where: { user_id: this.request.user.id },
      });
      if (!restaurant_cart) {
        restaurant_cart = await context.save(RestaurantCart, {
          user_id: this.request.user.id,
        });
      }

   
      const meal = await context.findOne(Meal, {
        where: { id: req.meal_id },
        relations:{restaurant_category:{restaurant:true}}
      });

      const is_another_cart=await context.findOne(RestaurantCartMeal, {
        where: { cart_id:restaurant_cart.id,meal:{restaurant_category:{restaurant:{id:Not(meal.restaurant_category.restaurant.id)}}}},
      })
      if (is_another_cart) throw new BadRequestException('message.clear_cart_before_adding_meal');
      if (!meal) throw new BadRequestException('message.meal_not_found'); 
      // Fetch required option groups from the database
      const allOptionGroupsForMeal = await context.find(MealOptionGroup, {
        where: { meal_id: req.meal_id },
        relations: { option_group: { options: true } },
      });
      // fetch requested option groups
      const proviededOptionGroups = await context.find(MealOptionGroup, {
        where: { option_group: {options:{id:In(req.options_ids)}},},relations:{option_group:true}
      });
  
    // Identify missing required groups
const missingRequiredGroups = allOptionGroupsForMeal.filter(
  (group) =>
    group.option_group.min_selection>0 &&
    !proviededOptionGroups.some(
      (reqGroup) => reqGroup.option_group_id === group.option_group.id,
    ),
);


if (missingRequiredGroups.length > 0) {
  throw new BadRequestException(
    'message.missing_required_groups')}
    if(req.options_ids){
allOptionGroupsForMeal.forEach( (group) => {
 const provided_options=group.option_group.options.filter((option)=>{
    return req.options_ids.includes(option.id)
  })

  if(group.option_group.min_selection>provided_options.length ){
    throw new BadRequestException('message.missing_required_groups')
  }
  if(group.option_group.max_selection<provided_options.length && group.option_group.max_selection!=null){
    throw new BadRequestException('message.missing_required_groups')
  }
  

})}

      const cart_meal = await context.save(RestaurantCartMeal, {
        cart_id: restaurant_cart.id,
        meal_id: req.meal_id,
      
        quantity: req.quantity,
      })   
      const cart_meal_options=req.options_ids.map((group)=> { return new RestaurantCartMealOption({cart_meal_id:cart_meal.id,option_id:group})})
     await context.save(cart_meal_options);
      return cart_meal

    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
