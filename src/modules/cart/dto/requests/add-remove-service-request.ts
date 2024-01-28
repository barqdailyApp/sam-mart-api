import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsNotEmpty } from "class-validator"

export class AddRemoveCartProductServiceRequest{

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    cart_product_id:string
    

    @ApiProperty({required:false})
    
    additions:string[]
    
    
    
    }