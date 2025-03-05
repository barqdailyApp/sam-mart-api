import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, IsNotEmpty, IsEnum, ValidateIf } from "class-validator";
import { DeliveryType } from "src/infrastructure/data/enums/delivery-type.enum";
import { PlatformType } from "src/infrastructure/data/enums/order-with-type.enum";
import { PaymentMethodRequest, OrderSlotRequest } from "src/modules/order/dto/request/make-order-request";

export class MakeRestaurantOrderRequest {

  @ApiProperty({required:false})
  @IsOptional()
  @IsString()
  note: string;
  @ApiProperty()
  @IsNotEmpty()
  payment_method: PaymentMethodRequest;
  

  @ApiProperty({
    type: 'enum',
    enum: [DeliveryType.FAST, DeliveryType.PICKUP],
  })
  @IsEnum(DeliveryType)
  @IsNotEmpty()
  delivery_type: DeliveryType;

  @ApiProperty({
    type: 'enum',
    enum: [PlatformType.WEB, PlatformType.MOBILE],
    required:false
  })
  @IsOptional()
  @IsEnum(PlatformType)
  @IsNotEmpty()
  platform: PlatformType;

  @ApiProperty({required:false})
  @IsOptional()
  @IsString()
  promo_code: string;
  

}