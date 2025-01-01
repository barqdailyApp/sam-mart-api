import { Expose, plainToInstance, Transform } from "class-transformer";
import { toUrl } from "src/core/helpers/file.helper";
import { MealResponse } from "./meal.response";


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

}
export class RestaurantResponse {
    @Expose()
    id: string;
    @Expose()
    name_ar: string;
    @Expose()
    name_en: string;
    @Expose()
    address_ar: string;
    @Expose()
    address_en: string;
    @Expose()
    opening_time: string;
    @Expose()
    closing_time: string;
    @Expose()
    @Transform(({ value }) => toUrl(value)) 
    logo: string[];
    @Expose()
    @Transform(({ value }) => toUrl(value)) 
    image: string[];
    
    @Expose()
    distance: number;

    @Expose()
    average_rating: number;

    @Expose()
    no_of_reviews: number;

    @Expose()
    min_order_price: number;
    @Expose()
    @Transform((value)=>plainToInstance(RestaurantCategoryResponse,value.obj.categories,{excludeExtraneousValues:true}))
    categories: RestaurantCategoryResponse[];
}


