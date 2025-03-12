import { Expose, Transform, Type } from "class-transformer";
import { toUrl } from "src/core/helpers/file.helper";
import { RestaurantResponse } from "./restaurant.response";


export class CuisineResponse {
    @Expose()
    id: string;
    @Expose()
    name_ar: string;
    @Expose()
    name_en: string;
    @Expose()
    @Transform(({ value }) => toUrl(value))
    logo: string[];
    @Expose()
    order_by: number;
    @Expose()
    @Type(() => RestaurantResponse)
    restaurants:RestaurantResponse[]

}