import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { IsNotExist } from 'src/core/validators/record-not-exists.validator';

export class UpdateVehicleRequest {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty({
    type: 'string',
    default: 'alfa-romeo',
  })
  @IsNotEmpty()
  @IsString()
  @IsNotExist('vehicle_brand', { message: 'Brand not found' })
  @IsOptional()
  brand_id: string;

  @ApiProperty({
    type: 'string',
    default: 'alfa-romeo-giulia',
  })
  @IsNotExist('vehicle_brand_model', { message: 'Model not found' })
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  brand_model_id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  color_id: string;

  @ApiProperty({ type: 'string', default: 'ABC-123' })
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  plate: string;


 

  @ApiProperty({ type: 'number', default: new Date().getFullYear() })
  @IsNotEmpty()
  @IsOptional()
  year: number;
}
