import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
export class UpdateAboutUsRequest {
  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  title_ar: string;
  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  title_en: string;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  description_ar: string;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  description_en: string;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  background_image_url: string;
}
