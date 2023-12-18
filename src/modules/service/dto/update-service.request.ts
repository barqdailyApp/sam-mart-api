import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateServiceRequest {

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  service_id: string;
  
  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  name_ar: string;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  name_en: string;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsNumber()
  duration_by_minute: number;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsNumber()
  price: number;
}
