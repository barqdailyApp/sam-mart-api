import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDecimal,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';
import { DeliveryType } from 'src/infrastructure/data/enums/delivery-type.enum';
import { PaymentMethodEnum } from 'src/infrastructure/data/enums/payment-method';

export class AddShipmentFeedBackRequest {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  driver_id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  shipment_id: string;

  @ApiProperty({ default: 0 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(5)
  delivery_time: number;

  @ApiProperty({ default: 0 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(5)
  packaging: number;

  @ApiProperty({ default: 0 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(5)
  communication: number;
}
