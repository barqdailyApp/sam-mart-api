import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsString, IsNumber, IsBoolean } from "class-validator";

export class CreateLinkProductSubcategoryRequest {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    categorySubCategory_id: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    product_id: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    order_by: number;

    @ApiProperty({ default: true })
    @IsNotEmpty()
    @Transform(({ value }) => {
      return value === 'true' || value === true;
    })
    @IsBoolean()
    is_active: boolean;
}