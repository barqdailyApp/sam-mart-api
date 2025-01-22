import { Restaurant } from "src/infrastructure/entities/restaurant/restaurant.entity";
import { MakeRestaurantOrderRequest } from "../dto/request/make-restaurant-order.request";
import { RestaurantOrder } from "src/infrastructure/entities/restaurant/order/restaurant_order.entity";
import { Injectable, Inject, BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { REQUEST } from "@nestjs/core";
import { BaseTransaction } from "src/core/base/database/base.transaction";
import { FileService } from "src/modules/file/file.service";
import { DataSource, EntityManager } from "typeorm";
import { plainToInstance } from "class-transformer";
import { RestaurantCartMeal } from "src/infrastructure/entities/restaurant/cart/restaurant-cart-meal.entity";
import { Request } from "express";
import { RestaurantOrderMeal } from "src/infrastructure/entities/restaurant/order/restaurant_order_meal.entity";
@Injectable()
export class MakeOrderTransaction extends BaseTransaction<
  MakeRestaurantOrderRequest,
  RestaurantOrder
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
    req: MakeRestaurantOrderRequest,
    context: EntityManager,
  ): Promise<RestaurantOrder> {
   
      try {
        const order = plainToInstance(RestaurantOrder, req);
        const cart_meals = await context.find(RestaurantCartMeal, {
            where:{
                cart:{
                    user_id: this.request.user.id
                },
            },
            relations:{meal:true,cart_meal_options:{option:true}}
        })
        if(cart_meals.length == 0){
            throw new BadRequestException('message.cart_empty')}
            // tranfer cart_meals to order_meals
            order.restaurant_order_meals= cart_meals.map(cart_meal=>{
                return plainToInstance(RestaurantOrderMeal,{
                    meal_id: cart_meal.meal_id,
                    quantity: cart_meal.quantity,
                    price: cart_meal.meal.price,
                    total_price: Number(cart_meal.meal.price)+Number(cart_meal.cart_meal_options.map(cart_meal_option=>cart_meal_option.option.price).reduce((a,b)=>a+b,0)),
                    restaurant_order_meal_options:cart_meal.cart_meal_options.map(cart_meal_option=>{return {option_id:cart_meal_option.option_id,price:cart_meal_option.option.price}})
                }
            
            )
                
                
            })

            
        return await context.save(order);
     
      } catch (error) {
        throw new BadRequestException(error.message);
      }
    }
    
  }

