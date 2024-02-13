import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateProductMeasurementRequest {

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsNumber()
  conversion_factor: number;

  

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @Transform(({ value }) => {
    return value === 'true'  || value === true;
  })
  is_main_unit: boolean;
}
