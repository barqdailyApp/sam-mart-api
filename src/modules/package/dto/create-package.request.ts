import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePackageRequest {

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
  @IsNumber()
  order_by: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  price_wash_single: number;
  
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  total_price_package: number;
  
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  wash_count: number;

  
  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  description_ar: string;
  
  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  description_en: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  background_url: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  expiry_date_in_days: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  buy_by_points: number;
}
