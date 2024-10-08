import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsUUID, IsEnum, IsNumber } from 'class-validator';
import { ReturnOrderStatus } from 'src/infrastructure/data/enums/return-order-status.enum';

export class EditDeliveryOrderRequest {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  order_id: string;

  @ApiProperty()
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  price: number;
}
