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
  description: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  logo: string;

  @ApiProperty({ default: true })
  @IsNotEmpty()
  @Transform(({ value }) => {
    return value === 'true';
  })
  @IsBoolean()
  is_active: boolean;

  @ApiProperty({ default: true })
  @IsNotEmpty()
  @Transform(({ value }) => {
    return value === 'true';
  })
  @IsBoolean()
  is_recovered: boolean;

  @ApiProperty()
  @IsNotEmpty()
  @IsArray()
  product_images: string[];

  @ApiProperty({ isArray: true, type: () => CreateProductMeasurementRequest }) // Use a factory function to specify the array type
  measurements: CreateProductMeasurementRequest[];
}
