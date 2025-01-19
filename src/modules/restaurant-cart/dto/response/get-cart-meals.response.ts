import { Expose } from "class-transformer";
import { MealResponse } from "src/modules/restaurant/dto/responses/meal.response";

export class GetCartMealsResponse extends MealResponse  {
    @Expose()
    total_price: number
    @Expose()
    meal_id: string
    @Expose()
    quantity: number
}