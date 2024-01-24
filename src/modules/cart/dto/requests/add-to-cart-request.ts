import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsArray, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class AddToCartRequest{

@ApiProperty()
@IsString()
@IsNotEmpty()
product_category_price_id:string




@ApiProperty({required:false})

additions:string[]



}