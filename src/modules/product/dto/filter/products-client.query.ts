import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class ProductClientQuery {
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
  longitude: string;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  latitude: string;

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
  category_sub_category_id: string;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  product_name: string;

  @ApiProperty({ required: false, enum: ['lowest_price', 'highest_price', 'new'], default: 'new' })
  @IsOptional()
  @IsString()
  sort: 'lowest_price' | 'highest_price' | 'new';

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  user_id: string;

  constructor(query:  Partial<ProductClientQuery>) {
    Object.assign(this, query);
  }
}
