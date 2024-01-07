import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateMeasurementUnitRequest {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name_ar: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name_en: string;



  

}
