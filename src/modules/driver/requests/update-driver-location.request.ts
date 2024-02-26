import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateDriverLocationRequest {

  @ApiProperty({default:24.774265})
  @IsNotEmpty()
  latitude: number;

  @ApiProperty({default:46.738586})
  @IsNotEmpty()
  longitude: number;

  // @ApiProperty()
  // @IsString()
  // latitude: string;

  // @ApiProperty()
  // @IsString()
  // latitude: string;
}
