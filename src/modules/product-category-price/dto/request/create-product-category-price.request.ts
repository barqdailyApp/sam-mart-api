import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
export class CreateProductCategoryPriceRequest {
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
