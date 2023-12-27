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
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  product_id: string;

  
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  product_measurement_unit_id: string;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsNumber()
  conversion_factor: number;

  
  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  measurement_unit_id: string;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @Transform(({ value }) => {
    return value === 'true';
  })
  is_main_unit: boolean;
}
