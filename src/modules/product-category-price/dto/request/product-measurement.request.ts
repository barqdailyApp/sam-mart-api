import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class ProductMeasurementRequest {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  product_measurement_id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  min_order_quantity: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  max_order_quantity: number;
}
