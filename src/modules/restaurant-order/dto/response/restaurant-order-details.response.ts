import { Expose, plainToInstance, Transform } from "class-transformer";
import { RestaurantOrderListResponse } from "./restaurant-order-list.response";
import { MealResponse } from "src/modules/restaurant/dto/responses/meal.response";

export class RestaurantOrderDetailsResponse extends RestaurantOrderListResponse{ 

    @Expose()
    @Transform(({ obj }) => obj.restaurant_order_meals.map((meal) => plainToInstance(MealResponse,{...meal.meal,price:meal.price,meal_id:meal.meal.id,id:meal.id,options:meal.restaurant_order_meal_options,total_price:meal.total_price,quantity:meal.quantity},{excludeExtraneousValues:true})))
    meals:MealResponse[]


    @Expose()
     order_confirmed_at: Date;
   
     @Expose()
     order_on_processed_at: Date;
   
     @Expose()
     order_ready_for_pickup_at: Date;
   
     @Expose()
     order_shipped_at: Date;
   
     @Expose()
     order_delivered_at: Date;

   
    @Expose()
     order_canceled_at: Date;
    
    
}