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
import { CreateProductImageRequest } from './create-product-image.request';

export class CreateProductRequest {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name_ar: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name_en: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  description_ar: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  description_en: string;

  @ApiProperty({ default: true })
  @IsNotEmpty()
  @Transform(({ value }) => {
    return value === 'true'  || value === true;
  })
  @IsBoolean()
  is_active: boolean;

  @ApiProperty({ default: true })
  @IsNotEmpty()
  @Transform(({ value }) => {
    return value === 'true'  || value === true;
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
