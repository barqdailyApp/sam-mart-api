import { fa } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';
import { DeliveryType } from 'src/infrastructure/data/enums/delivery-type.enum';
import { PlatformType } from 'src/infrastructure/data/enums/order-with-type.enum';
import { PaymentMethodEnum } from 'src/infrastructure/data/enums/payment-method';

export class PaymentMethodRequest {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  payment_method_id: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @ValidateIf((obj) => obj. payment_method_id !=null)
  transaction_number: string;



  @ApiProperty()
  @IsOptional()
  @IsString()
  @ValidateIf((obj) => obj. payment_method_id !=null)
  wallet_number: string;
}

export class OrderSlotRequest {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  slot_id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  day: string;
}

export class MakeOrderRequest {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  section_id: string;

  @ApiProperty({required:false})
  @IsOptional()
  @IsString()
  promo_code: string;


  @ApiProperty({required:false})
  @IsOptional()
  @IsString()
  note: string;
  @ApiProperty()
  @IsNotEmpty()
  payment_method: PaymentMethodRequest;

  @ApiProperty({
    type: 'enum',
    enum: [DeliveryType.FAST, DeliveryType.SCHEDULED],
  })
  @IsEnum(DeliveryType)
  @IsNotEmpty()
  delivery_type: DeliveryType;

  @ApiProperty()
  @IsNotEmpty()
  @ValidateIf((obj) => obj.delivery_type === DeliveryType.SCHEDULED)
  slot_day: OrderSlotRequest;


  @ApiProperty({
    type: 'enum',
    enum: [PlatformType.WEB, PlatformType.MOBILE],
    required:false
  })
  @IsOptional()
  @IsEnum(PlatformType)
  @IsNotEmpty()
  platform: PlatformType;

}
