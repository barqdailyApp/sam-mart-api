import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsDate, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class MakeMealOfferRequest {
 @ApiProperty()
 @IsString()
 meal_id:string   

 @ApiProperty()
 @IsDate()
    @Transform(({ value }) => new Date(value))
 start_date:Date

 @ApiProperty()
 @IsDate()
    @Transform(({ value }) => new Date(value))
 end_date:Date

 @ApiProperty()
 @IsNumber()
 @Min(1)
 @Max(100)
 discount_percentage:number

 @ApiProperty()
 @IsBoolean()
 @IsOptional()
 @Transform(({ value }) => Boolean(value))
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
 @Transform(({ value }) => new Date(value))
 @IsOptional()
 start_date:Date

 @ApiProperty()
 @IsDate()
    @Transform(({ value }) => new Date(value))
 @IsOptional()
 end_date:Date

 @ApiProperty()
 @IsNumber()
 @IsOptional()
 @Min(1)
 @Max(100)
 discount_percentage:number

 @ApiProperty()
 @IsBoolean()
 @IsOptional()
 @Transform(({ value }) => Boolean(value))
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