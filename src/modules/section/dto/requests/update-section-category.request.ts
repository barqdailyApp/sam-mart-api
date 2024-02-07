import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { required } from 'joi';

export class UpdateSectionCategoryRequest {
  @ApiProperty({ required: false })
  @IsString()
  id: string;
  @ApiProperty({ required: false })
  // @IsBoolean()
  is_active: boolean;

  @ApiProperty({ required: false })
  // @IsNumber()
  @Transform(({ value }) => Number(value))
  order_by: number;
}
