import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsOptional, IsString, isArray } from 'class-validator';

export class OrderBookingRequest {
  @ApiPropertyOptional()
  services: string[];

  @ApiProperty()
  @IsString()
  slot_id: string;

  
  @ApiProperty()
  @IsString()
  subscription_id: string;


  @ApiProperty()
  @IsString()
  order_date: string;


  @ApiProperty()
  @IsString()
  vehicle_id: string;

  @ApiProperty()
  @IsString()
  address_id: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  customer_id?: string;
}
