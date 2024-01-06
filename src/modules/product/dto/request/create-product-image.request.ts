import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateProductImageRequest {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  url: string;


  @ApiProperty({ default: false })
  @IsNotEmpty()
  @Transform(({ value }) => {
    return value === 'true'  || value === true;
  })
  @IsBoolean()
  is_logo: boolean;
}
