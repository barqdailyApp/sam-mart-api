import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { PaymentMethod } from 'src/infrastructure/data/enums/payment-method';

export class OrderClientQuery {
  @ApiProperty({ required: false, default: 1 })
  @Transform(({ value }) => {
    return Number(value);
  })
  @IsNumber()
  page: number;

  @ApiProperty({ required: false, default: 10 })
  @Transform(({ value }) => {
    return Number(value);
  })
  @IsNumber()
  limit: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  order_date: string;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @Transform(({ value }) => {
    return value === 'true' || value === true;
  })
  @IsBoolean()
  is_paid: boolean;

  @ApiProperty({ required: false, enum: PaymentMethod })
  @IsOptional()
  @IsString()
  payment_method: PaymentMethod;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  warehouse_name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  driver_name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  client_name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  client_phone: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  order_number: string;
}
