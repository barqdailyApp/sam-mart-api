import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsDate, IsNumber, IsOptional, IsString } from "class-validator";

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
 @IsNumber()
 discount_percentage:number

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


 @ApiProperty()
 @IsNumber()
 @IsOptional()
 order_by:number
}

export class UpdateMealOfferRequest {
 @ApiProperty()
 @IsString()
 id:string   

 @ApiProperty() 
 @IsDate()
 @IsOptional()
 start_date:Date

 @ApiProperty()
 @IsDate()
 @IsOptional()
 end_date:Date

 @ApiProperty()
 @IsNumber()
 @IsOptional()
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


 @ApiProperty()
 @IsNumber()
 @IsOptional()
 order_by:number
}