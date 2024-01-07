import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CategorySubcategoryRequest {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  section_category_id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  subcategory_id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  is_active: boolean;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  order_by: number;
}
