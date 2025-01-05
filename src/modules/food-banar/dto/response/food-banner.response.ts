import { Expose, Transform } from "class-transformer";
import { toUrl } from "src/core/helpers/file.helper";
import { BannerResponse } from "src/modules/banar/dto/response/banner.response";

export class FoodBannerResponse extends BannerResponse{
    @Expose() restaurant_id: string;
   
}