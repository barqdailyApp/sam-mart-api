import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsString, IsBoolean, IsNumber, Validate } from "class-validator";
import { IsUnique } from "src/core/validators/unique-constraints.validator";

export class updateCategorySubcategoryRequest {
    
  
    @ApiProperty({ required: false })
    @IsString()
    id: string;
    @ApiProperty({ required: false })
    // @IsBoolean()
    is_active: boolean;
  
    @ApiProperty({ required: false })
    // @IsNumber()
 
    @Transform(({ value }) => Number(value))
    order_by: number;
    
    
}