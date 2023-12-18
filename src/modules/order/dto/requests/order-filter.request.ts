import { ApiProperty, ApiPropertyOptional, ApiQuery } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  isArray,
} from 'class-validator';
import { toRightNumber } from 'src/core/helpers/cast.helper';
import { OrderStatus } from 'src/infrastructure/data/enums/order-status.enum';

export class OrderFilterRequest {
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

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  order_date: string;

  @ApiProperty({
    nullable: true,
    required: false,
    enum: [
      OrderStatus.CREATED,
      OrderStatus.BIKER_ON_THE_WAY,
      OrderStatus.BIKER_ARRIVED,
      OrderStatus.STARTED,
      OrderStatus.COMPLETED,
      OrderStatus.CANCELLED,
    ],
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @ApiProperty({ nullable: true, required: false, })
  @Transform(({ value }) => {
    return value === 'true';
  })
  @IsOptional()
  @IsBoolean()
  is_complete: boolean;
  
  @ApiProperty({ nullable: true, required: false, })
  @Transform(({ value }) => {
    return value === 'true';
  })
  @IsOptional()
  @IsBoolean()
  is_ongoing: boolean;
}
