import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateSingleImageRequest {
  @ApiProperty({ type: 'file', required: true })
  file: Express.Multer.File;
  

  @ApiProperty({ default: false })
  @IsNotEmpty()
  @Transform(({ value }) => {
    return value === 'true' || value === true;
  })
  @IsBoolean()
  is_logo: boolean;
}
