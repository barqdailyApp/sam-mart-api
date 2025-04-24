import { Res } from "@nestjs/common";
import { Expose, Transform, Type } from "class-transformer";
import { toUrl } from "src/core/helpers/file.helper";
import { BannerResponse } from "src/modules/banar/dto/response/banner.response";
import { RestaurantResponse } from "src/modules/restaurant/dto/responses/restaurant.response";

export class FoodBannerResponse extends BannerResponse{
    @Expose()
    @Type(() => RestaurantResponse)
     restaurant: RestaurantResponse;
   
}