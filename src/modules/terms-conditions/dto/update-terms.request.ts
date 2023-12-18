import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateTermsRequest {
  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  title_ar: string;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  description_ar: string;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  title_en: string;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  description_en: string;
}
