import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateSingleImageRequest {
  @ApiProperty({ type: 'file',  nullable: true, required: false  })
  file: Express.Multer.File;
  

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @Transform(({ value }) => {
    return value === 'true'  || value === true;
  })
  is_logo: boolean;
}
