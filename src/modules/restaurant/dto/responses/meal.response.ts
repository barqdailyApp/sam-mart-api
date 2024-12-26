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
}