import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateDriverLocationRequest {

  @ApiProperty({ type: 'double precision' })
  @IsNotEmpty()
  latitude: number;

  @ApiProperty({ type: 'double precision' })
  @IsNotEmpty()
  longitude: number;
}
