import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
export class UpdateAppConstantsRequest {
  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  logo_app: string;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  company_address: string;


  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsNumber()
  tax_rate: number;


  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsNumber()
  biker_wash_point: number;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsNumber()
  client_wash_point: number;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  vat_number: string;



}
