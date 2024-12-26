import { Expose, Transform } from "class-transformer";
import { toUrl } from "src/core/helpers/file.helper";

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
    @Transform(({ value }) => toUrl(value)) 
    image: string[];
    
    @Expose()
    distance: number;

    @Expose()
    min_order_price: number;
    @Expose()
    categories: string[];
}