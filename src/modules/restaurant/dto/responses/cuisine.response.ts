import { Expose, Transform } from "class-transformer";
import { toUrl } from "src/core/helpers/file.helper";


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

}