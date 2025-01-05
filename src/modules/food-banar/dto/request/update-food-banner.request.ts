import { IsBoolean, IsDateString, IsOptional, IsString } from "class-validator";

import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { UpdateBannerRequest } from "src/modules/banar/dto/request/update-banner.request";

export class UpdateFoodBannerRequest extends UpdateBannerRequest {
   
   @ApiProperty({  required:false})
    @IsOptional()
    @IsString()
    restaurant_id: string
}