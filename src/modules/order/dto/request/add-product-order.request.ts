import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsArray, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class AddProductOrderRequest{




    @ApiProperty()
@IsString()
@IsNotEmpty()
shipment_id:string

@ApiProperty()
@IsString()
@IsNotEmpty()
product_category_price_id:string


@ApiProperty()
@Transform(({value})=>Number(value))
@IsNumber()
@IsNotEmpty()
quantity:number




@ApiProperty({required:false})

additions:string[]



}