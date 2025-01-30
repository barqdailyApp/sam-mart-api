import { Expose, plainToInstance, Transform } from "class-transformer";
import { MealResponse } from "src/modules/restaurant/dto/responses/meal.response";
import { RestaurantResponse } from "src/modules/restaurant/dto/responses/restaurant.response";

export class RestaurantCartMealResponse  {
    @Expose()
    @Transform(({ obj }) => obj.meals.map((meal) => plainToInstance(GetCartMealsResponse,meal,{excludeExtraneousValues:true})))
    meals: GetCartMealsResponse[]
    @Expose()
    @Transform(({ obj }) => plainToInstance(RestaurantResponse, obj.restaurant,{excludeExtraneousValues:true}))
    restaurant:RestaurantResponse
}

export class GetCartMealsResponse extends MealResponse  {
    @Expose()
    total_price: number
    @Expose()
    meal_id: string
    @Expose()
    quantity: number
}