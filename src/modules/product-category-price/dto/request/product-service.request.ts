import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsNumber } from "class-validator";

export class ProductServiceRequest {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    additional_services_id: string;
  
    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    price: number;
  
   
  }