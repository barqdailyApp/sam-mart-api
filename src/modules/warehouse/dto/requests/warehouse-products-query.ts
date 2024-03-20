import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class WarehouseProductsQuery {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  warehouse_id: string;

  @ApiProperty({default: 20})

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  limit: number;

  @ApiProperty({ default: 1 })

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  page: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  product_barcode: string;
}
