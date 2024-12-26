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
    @Transform(({ value }) => {
        console.log(value);
        if (value && typeof value === 'object') {
          return {
            id: value.id,
            name_ar: value.name_ar,
            name_en: value.name_en,
            restaurant_id: value.restaurant_id,
          };
        }
        return null; // Handle cases where `value` is null or not an object
      })
      restaurant_category: any;
}