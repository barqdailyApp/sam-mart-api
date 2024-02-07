import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
  Validate,
} from 'class-validator';
import {
  IsUnique,
  Unique,
} from 'src/core/validators/unique-constraints.validator';

export class SectionCategoryRequest {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  section_id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  category_id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  is_active: boolean;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Validate(IsUnique, ['SectionCategory'])
  @Transform(({ value }) => Number(value))
  order_by: number;
}
