import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdatePackageRequest {

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
  order_by: number;
  
  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsNumber()
  price_wash_single: number;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsNumber()
  total_price_package: number;
  
  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
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

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  background_url: string;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  background_url_internal: string;
  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsNumber()
  expiry_date_in_days: number;
  
  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsNumber()
  buy_by_points: number;


}
