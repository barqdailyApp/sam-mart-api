import { Expose, plainToInstance, Transform, Type } from "class-transformer";
import { toUrl } from "src/core/helpers/file.helper";
import { MealResponse } from "./meal.response";
import { CuisineResponse } from "./cuisine.response";
import { RestaurantSchedule } from "src/infrastructure/entities/restaurant/order/restaurant_schedule.entity";


export class RestaurantCategoryResponse{
    @Expose()
    id:string
    @Expose()
    name_ar:string
    @Expose()
    name_en:string
    @Expose()
    @Transform((value)=>plainToInstance(MealResponse,value.obj.meals,{excludeExtraneousValues:true}),)
    meals:MealResponse[]
    @Expose()
    is_active:boolean

}
export class RestaurantResponse {
    @Expose()
    id: string;

    @Expose()
    status: string;
    @Expose()
    name: string;
    @Expose()
    name_ar: string;
    @Expose()
    name_en: string;
    @Expose()
    address_ar: string;
    @Expose()
    address: string;
    @Expose()
    address_en: string;
    @Expose()
    is_open: boolean;
    @Expose()
    city_id: string;
    @Expose()
    @Transform(({ value }) => toUrl(value)) 
    logo: string[];
    @Expose()
    @Transform(({ value }) => toUrl(value)) 
    image: string[];
    
    @Expose()
    distance: number;
    @Expose()
    latitude: number;
    @Expose()
    longitude: number;
    @Expose()
    average_rating: number;
    @Expose()
    average_prep_time:number
    @Expose()
    @Type(() => MealResponse)
    meals: MealResponse[];

    @Expose()
    no_of_reviews: number;

    @Expose()
    min_order_price: number;
    @Expose()
    @Transform((value)=>plainToInstance(RestaurantCategoryResponse,value.obj.categories,{excludeExtraneousValues:true}))
    categories: RestaurantCategoryResponse[];

    @Expose()
    estimated_delivery_time: number;
    @Expose()
    @Type(() => CuisineResponse)
    cuisine_types: CuisineResponse[];

    @Expose()
    @Type(() => RestaurantSchedule)
    schedules: RestaurantSchedule[];
}



