import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { OrderBookingRequest } from 'src/modules/order/dto/requests/order-booking-request';

export class SubscriptionRequest {
  @ApiProperty()
  @IsString()
  package_id: string;

  @ApiPropertyOptional()
  services?: string[];

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  promo_code_id?: string;

 
  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  user_id?: string;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  receiver_phone_number?: string;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()

  order?: OrderBookingRequest;

  is_new_user?: boolean;


  constructor(data: SubscriptionRequest) {
    Object.assign(this, data);
  }
}
