import { Expose, Transform } from "class-transformer";
import { toUrl } from "src/core/helpers/file.helper";

export class MealResponse {
    @Expose()
    id: string;
    @Expose()
    name_ar: string;
    @Expose()
    name_en: string;
    @Expose()
    description_ar: string;
    @Expose()
    description_en: string;
    @Expose()
    price: number;
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
}