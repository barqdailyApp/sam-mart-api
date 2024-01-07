import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class ProductAdditionalServiceRequest {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  additional_service_id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  price: number;
}
