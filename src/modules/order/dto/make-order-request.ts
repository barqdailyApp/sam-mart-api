import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { DeliveryType } from 'src/infrastructure/data/enums/delivery-type.enum';
import { PaymentMethod } from 'src/infrastructure/data/enums/payment-method';

export class MakeOrderRequest {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  section_id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  address_id: string;

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
}
