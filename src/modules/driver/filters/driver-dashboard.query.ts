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
import { DriverStatus } from 'src/infrastructure/data/enums/driver-status.enum';
import { DriverTypeEnum } from 'src/infrastructure/data/enums/driver-type.eum';
import { PaymentMethodEnum } from 'src/infrastructure/data/enums/payment-method';
import { ShipmentStatusEnum } from 'src/infrastructure/data/enums/shipment_status.enum';
import { UserStatus } from 'src/infrastructure/data/enums/user-status.enum';

export class DriversDashboardQuery {
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
  created_at: string;

  @ApiProperty({enum:DriverTypeEnum})
  @IsOptional()
  @IsEnum(DriverTypeEnum)
  type:DriverTypeEnum

  @ApiProperty({
    required: false,
    description: 'search by client email or client name or client phone',
  })
  @IsOptional()
  @IsString()
  driver_search: string;

  @ApiProperty({
    nullable: true,
    required: false,
    enum: DriverStatus,
  })
  @IsOptional()
  @IsEnum(DriverStatus)
  status: DriverStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  country_id: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  city_id: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  region_id: string;

  @ApiProperty({
    nullable: true,
    required: false,
  })
  @Transform(({ value }) => {
    return value.toUpperCase();
  })
  @IsOptional()
  vehicle_type: string;
}
