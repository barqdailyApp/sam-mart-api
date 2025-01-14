import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class AddMealRequest{
   @ApiProperty()
    @IsNotEmpty()
    @IsString()
    name_ar: string

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    name_en: string
    
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    restaurant_category_id: string 

    
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    image: string 

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    description_ar: string

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    description_en: string 

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    price: string 
}