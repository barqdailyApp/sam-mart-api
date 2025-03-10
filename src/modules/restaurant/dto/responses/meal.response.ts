import { Expose, plainToInstance, Transform, Type } from "class-transformer";
import { toUrl } from "src/core/helpers/file.helper";
import { MealOptionGroup } from "src/infrastructure/entities/restaurant/meal/meal-option-group";
import { OptionGroup } from "src/infrastructure/entities/restaurant/option/option-group.entity";

import { Option } from "src/infrastructure/entities/restaurant/option/option.entity";
import { OptionGroupResponse } from "./option-group.response";
import { OptionRespone } from "./option.response";
export class MealResponse {
    @Expose()
    id: string;
    @Expose()
    meal_id:string
    @Expose()
    name: string;
    @Expose()
    name_ar: string;
    @Expose()
    name_en: string;
  
    @Expose()
    description: string;
    @Expose()
    quantity: number;
    @Expose()
    description_ar: string;
    @Expose()
    description_en: string;
    @Expose()
    price: number;
    @Expose()
    total_price: number;
    @Expose()
    @Transform(({ value }) => toUrl(value)) 
    image: string;
    @Expose()
    @Transform(( value ) => {
    
        if (value.obj.restaurant_category && typeof value.obj.restaurant_category === 'object') {
          return {
            id: value.obj.restaurant_category.id,
            name_ar: value.obj.restaurant_category.name_ar,
            name_en: value.obj.restaurant_category.name_en,
            restaurant_id: value.obj.restaurant_category.restaurant_id,
          };
        }
        return null; // Handle cases where `value` is null or not an object
      })
      restaurant_category: any;

      @Expose()
      @Transform((value)=>{return value.obj.meal_option_groups?.map((item:MealOptionGroup)=>plainToInstance(OptionGroupResponse,{...item.option_group,id:item.id,order_by:item.order_by,is_active:item.is_active,option_group_id:item.option_group_id},{excludeExtraneousValues:true}))})
      option_groups:OptionGroupResponse[]

      @Expose()
      cart_quantity:number

      @Expose()
      cart_total_price:number

      @Expose()
      direct_add:boolean

      @Expose()
      is_active:boolean


        @Expose() 
        @Transform((value)=>{  return value.obj.options?.map((item)=>plainToInstance(OptionRespone,{option_id:item.option_id,...item.option,id:item.id,price:item.price},{excludeExtraneousValues:true}))})
        options:OptionRespone[]
}

export class MealOfferResponse{

    @Expose()
    id: string;
    @Expose()
    meal_id:string
    @Expose()
    description: string;
    @Expose()
    start_date: Date;
    @Expose()
    end_date: Date;
    @Expose()
    discount_percentage: number;
    @Expose()
    @Type(()=>MealResponse)
    meal:MealResponse

}