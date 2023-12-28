import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
export class UpdateProductCategoryPriceRequest {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  product_measurement_id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  product_category_price_id: string;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsNumber()
  price: number;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsNumber()
  min_order_quantity: number;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsNumber()
  max_order_quantity: number;
}
