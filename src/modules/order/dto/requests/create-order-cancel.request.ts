import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCancelOrderRequest {
  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  cancel_reason_id: string;



  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  order_id: string;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  another_reason: string;


}
