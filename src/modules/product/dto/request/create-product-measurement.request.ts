import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateProductMeasurementRequest {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  conversion_factor: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  measurement_unit_id: string;

  @ApiProperty({ default: false })
  @IsNotEmpty()
  @Transform(({ value }) => {
    return value === 'true'  || value === true;
  })
  @IsBoolean()
  is_main_unit: boolean;
}
