import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsNumber, IsString, Validate } from 'class-validator';
import { required } from 'joi';
import { IsUnique } from 'src/core/validators/unique-constraints.validator';

export class UpdateSectionCategoryRequest {
  @ApiProperty({ required: false })
  @IsString()
  id: string;
  @ApiProperty({ required: false })
  // @IsBoolean()
  is_active: boolean;

  @ApiProperty({ required: false })
  // @IsNumber()
  @Validate(IsUnique, ['SectionCategory'])
  @Transform(({ value }) => Number(value))
  order_by: number;
}
