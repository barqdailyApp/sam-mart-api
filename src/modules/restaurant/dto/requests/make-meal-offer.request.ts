import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsDate, IsOptional, IsString } from "class-validator";

export class MakeMealOfferRequest {
 @ApiProperty()
 @IsString()
 meal_id:string   

 @ApiProperty()
 @IsDate()
 start_date:Date

 @ApiProperty()
 @IsDate()
 end_date:Date

 @ApiProperty()
 @IsString()
 discount_percentage:string

 @ApiProperty()
 @IsBoolean()
 @IsOptional()
 is_active: boolean;

 @ApiProperty()
 @IsString()
 @IsOptional()
 description_ar:string

 @ApiProperty()
 @IsString()
 @IsOptional()
 description_en:string
}