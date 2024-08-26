import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class ProductsDashboardQuery {
  @ApiProperty({ required: false, default: 1 })
  @Transform(({ value }) => {
    return Number(value);
  })
  @IsNumber()
  page: number;

  @ApiProperty({ required: false, default: 10 })
  @Transform(({ value }) => {
    return Number(value);
  })
  @IsNumber()
  limit: number;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  section_id: string;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  brand_id: string;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  section_category_id: string;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  category_sub_category_id: string;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  product_name: string;
  
  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  product_barcode: string;

  @ApiProperty({ required: false, enum: ['new','order_by'], default: 'order_by' })
  @IsOptional()
  @IsString()
  sort: 'new' | 'order_by';
}
