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
import { UserStatus } from 'src/infrastructure/data/enums/user-status.enum';

export class UsersDashboardQuery {
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

  @ApiProperty({
    required: false,
    description: 'search by client email or client name or client phone',
  })
  @IsOptional()
  @IsString()
  client_search: string;

  @ApiProperty({
    nullable: true,
    required: false,
    enum: UserStatus,
  })
  @IsOptional()
  @IsEnum(UserStatus)
  status: UserStatus;
}
