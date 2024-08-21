import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
  isArray,
} from 'class-validator';
import { CreateProductMeasurementRequest } from './create-product-measurement.request';
import { CreateProductImageRequest } from './product-images/create-product-image.request';
import {
  IsUnique,
  Unique,
} from 'src/core/validators/unique-constraints.validator';

export class CreateProductRequest {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name_ar: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name_en: string;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  description_ar: string;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  description_en: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  keywords: string[];

  @ApiProperty()
  @IsNotEmpty()
  @Unique('Product')
  @IsString()
  barcode: string;
  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @Unique('Product')
  @IsString()
  row_number: number;

  @ApiProperty({ default: true })
  @IsNotEmpty()
  @Transform(({ value }) => {
    return value === 'true' || value === true;
  })
  @IsBoolean()
  is_active: boolean;

  @ApiProperty({ default: true })
  @IsNotEmpty()
  @Transform(({ value }) => {
    return value === 'true' || value === true;
  })
  @IsBoolean()
  is_recovered: boolean;

  @ApiProperty({ isArray: true, type: () => CreateProductImageRequest })
  @IsNotEmpty()
  @IsArray()
  product_images: CreateProductImageRequest[];

  @ApiProperty({ isArray: true, type: () => CreateProductMeasurementRequest }) // Use a factory function to specify the array type
  measurements: CreateProductMeasurementRequest[];
}
