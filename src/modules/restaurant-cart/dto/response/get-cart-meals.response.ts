import { Expose, plainToInstance, Transform } from 'class-transformer';
import { MealResponse } from 'src/modules/restaurant/dto/responses/meal.response';
import { RestaurantResponse } from 'src/modules/restaurant/dto/responses/restaurant.response';

export class RestaurantCartMealResponse {
  @Expose()
  @Transform(({ obj }) =>
    obj.restaurant_cart_meals.map((meal) =>
      plainToInstance(
        MealResponse,
        {
          ...meal.meal,
          price: meal.price,
          meal_id: meal.meal.id,
          id: meal.id,
          options: meal.restaurant_cart_meal_options,
          total_price: meal.total_price,
          quantity: meal.quantity,
        },
        { excludeExtraneousValues: true },
      ),
    ),
  )
  meals: MealResponse[];
  @Expose()
  @Transform(({ obj }) =>
    plainToInstance(RestaurantResponse, obj.restaurant, {
      excludeExtraneousValues: true,
    }),
  )
  restaurant: RestaurantResponse;
}

export class GetCartMealsResponse extends MealResponse {
  @Expose()
  total_price: number;
  @Expose()
  meal_id: string;
  @Expose()
  quantity: number;
  @Expose()
  note: string;
}
