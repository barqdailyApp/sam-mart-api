import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsArray, IsNotEmpty, IsNumber, IsString, isNotEmpty } from "class-validator";

export class UpdateCartProductRequest{

@ApiProperty()
@IsString()
@IsNotEmpty()
cart_product_id:string


@ApiProperty()
@IsNotEmpty()
@Transform(({value})=>(value=="true"?true:false))
add:boolean





}