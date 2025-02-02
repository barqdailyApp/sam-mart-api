import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";
import { Unique } from "src/core/validators/unique-constraints.validator";

export class AddRestaurantCategoryRequest {
    @ApiProperty()
    @IsString()
    @Unique('restaurant_category')
    name_ar: string

    @ApiProperty()
    @IsString()
    @Unique('restaurant_category')
    name_en: string

    @ApiProperty({required:false})
    @IsNumber()
    @IsOptional()
    order_by: number

    @ApiProperty({required:false})
    @IsBoolean()
    @IsOptional()
    is_active: boolean


}
export class UpdateRestaurantCategoryRequest {

    @ApiProperty()
    @IsString()
    id: string

    @ApiProperty({required:false})
    @IsString()
    @IsOptional()
    @Unique('restaurant_category')
    name_ar: string

    @ApiProperty({required:false})
    @IsString()
    @Unique('restaurant_category')
    name_en: string

    @ApiProperty({required:false})
    @IsNumber()
    @IsOptional()
    order_by: number

    @ApiProperty({required:false})
    @IsBoolean()
    @IsOptional()
    is_active: boolean


}