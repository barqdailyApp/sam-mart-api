import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsBoolean, IsNotEmpty, IsArray } from 'class-validator';

export class UpdateProductRequest {

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  name_ar: string;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  name_en: string;

  @ApiProperty({ required: false })
  
  @IsOptional()
  @IsArray()
  keywords: string[];

  @ApiProperty({required:false})
  @IsOptional()
  @IsString()
  brand_id: string;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  barcode: string;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  row_number: number;
  
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
  @Transform(({ value }) => {
    return value === 'true'  || value === true;
  })
  @IsBoolean()
  is_active: boolean;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @Transform(({ value }) => {
    return value === 'true'  || value === true;
  })
  @IsBoolean()
  is_recovered: boolean;



  
}
