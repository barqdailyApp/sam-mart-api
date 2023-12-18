import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateSocialRequest {

  
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  icon: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  link: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  scheme: string;
}
