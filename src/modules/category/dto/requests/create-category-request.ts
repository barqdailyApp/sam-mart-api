import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryRequest {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name_ar: string;
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name_en: string;

  @ApiProperty({ type: 'file' })
  logo: Express.Multer.File;
}
