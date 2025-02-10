import { Expose, plainToInstance, Transform } from "class-transformer";
import { RestaurantOrderListResponse } from "./restaurant-order-list.response";
import { MealResponse } from "src/modules/restaurant/dto/responses/meal.response";

export class RestaurantOrderDetailsResponse extends RestaurantOrderListResponse{ 

    @Expose()
    @Transform(({ obj }) => obj.restaurant_order_meals.map((meal) => plainToInstance(MealResponse,meal,{excludeExtraneousValues:true})))
    meals:MealResponse[]
    
}