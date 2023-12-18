import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateColorRequest {


  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name_ar: string;
  
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name_en: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  hex: string;

}
