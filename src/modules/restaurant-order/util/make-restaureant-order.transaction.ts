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
import { generateOrderNumber } from "src/modules/order/util/make-order.transaction";
import { DeliveryType } from "src/infrastructure/data/enums/delivery-type.enum";
import { Address } from "src/infrastructure/entities/user/address.entity";
@Injectable()
export class MakeRestaurantOrderTransaction extends BaseTransaction<
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
        const address=await context.findOneBy(Address,{user_id:this.request.user.id,is_favorite:true})
        if(!address) throw new BadRequestException('message.user_does_not_have_a_default_address')
        const order = plainToInstance(RestaurantOrder, req);
        order.address_id=address.id
        order.user_id = this.request.user.id;
        const date =
        req.delivery_type == DeliveryType.SCHEDULED
          ? new Date(req.slot_day?.day)
          : new Date();

  const isoDate = date.toISOString().slice(0, 10);
  const count = await context
  .createQueryBuilder(RestaurantOrder, 'restaurant_order')
  .where('DATE(restaurant_order.estimated_delivery_time) = :specificDate', { specificDate: isoDate })
  .getCount();
order.estimated_delivery_time = date; 
order.number= generateOrderNumber(count,isoDate)



// handle payment



// handle cart
        const cart_meals = await context.find(RestaurantCartMeal, {
            where:{
                cart:{
                    user_id: this.request.user.id
                },
            },
            relations:{meal:true,cart_meal_options:{option:true}}
        })
      
        if(cart_meals?.length == 0){
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
            await context.remove(cart_meals)
            
       


        return await context.save(order);
     
      } catch (error) {
        throw new BadRequestException(error.message);
      }
    }
    
  }

