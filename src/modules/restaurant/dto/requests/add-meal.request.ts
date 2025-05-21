import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class AddMealRequest {
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
  restaurant_category_id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  image: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  description_ar: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  description_en: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @ApiProperty({ required: false })
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  @IsOptional()
  is_active: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  add_note: boolean;
}

export class UpdateMealRequest {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  id: string;
  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  is_active: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  add_note: boolean;

  @ApiProperty()
  @IsOptional()
  @IsString()
  name_ar: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  name_en: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  restaurant_category_id: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  image: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  description_ar: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  description_en: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  price: number;
}
