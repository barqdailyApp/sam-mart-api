import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { DeliveryType } from 'src/infrastructure/data/enums/delivery-type.enum';
import { PaymentMethod } from 'src/infrastructure/data/enums/payment-method';
import { ShipmentStatusEnum } from 'src/infrastructure/data/enums/shipment_status.enum';

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

  @ApiProperty({ required: false, enum: DeliveryType })
  @IsOptional()
  @IsString()
  delivery_type: DeliveryType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  warehouse_id: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  driver_id: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  client_id: string;

  @ApiProperty({ required: false,description:"search by order number or client name or client phone" })
  @IsOptional()
  @IsString()
  order_search: string;

  @ApiProperty({
    nullable: true,
    required: false,
    enum: ShipmentStatusEnum,
  })
  @IsOptional()
  @IsEnum(ShipmentStatusEnum)
  status: ShipmentStatusEnum;
}
