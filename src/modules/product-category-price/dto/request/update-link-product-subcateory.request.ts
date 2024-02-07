import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateLinkProductSubcategoryRequest {

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsNumber()
  order_by: number;


  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @Transform(({ value }) => {
    return value === 'true'  || value === true;
  })
  is_active: boolean;
}
