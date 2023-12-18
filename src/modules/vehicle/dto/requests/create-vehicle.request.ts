import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString,  } from 'class-validator';
import { IsExist } from 'src/core/validators/record-exists.validator';

export class CreateVehicleRequest {



  @ApiProperty({
    type: 'string',
    default: 'alfa-romeo',
  })
  @IsNotEmpty()
  @IsString()
  @IsExist('vehicle_brand', { message: 'Brand not found' })
  brand_id: string;

  @ApiProperty({
    type: 'string',
    default: 'alfa-romeo-giulia',
  })
  @IsExist('vehicle_brand_model', { message: 'Model not found' })
  @IsNotEmpty()
  @IsString()
  brand_model_id: string;

  
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  color_id: string;

  @ApiProperty({ type: 'string', default: 'ABC-123' })
  plate: string;



}
