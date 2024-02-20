import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class WarehouseProductsQuery {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  warehouse_id: string;

  @ApiPropertyOptional({default: 20})
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  limit: number;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  page: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name: string;
}
