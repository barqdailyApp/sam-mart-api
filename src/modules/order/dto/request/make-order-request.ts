import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, ValidateIf } from 'class-validator';
import { DeliveryType } from 'src/infrastructure/data/enums/delivery-type.enum';
import { PaymentMethod } from 'src/infrastructure/data/enums/payment-method';

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



  @ApiProperty({
    type: 'enum',
    enum: [PaymentMethod.CASH, PaymentMethod.ONLINE],
  })
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  payment_method: PaymentMethod;

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
}
