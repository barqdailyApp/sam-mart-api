import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { ShipmentStatusEnum } from 'src/infrastructure/data/enums/shipment_status.enum';

export class DriverShipmentsQuery {
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

  @ApiProperty({
    nullable: true,
    required: false,
    enum: ShipmentStatusEnum,
  })
  @IsOptional()
  @IsEnum(ShipmentStatusEnum)
  status: ShipmentStatusEnum;


  @ApiProperty({ nullable: true, required: false ,example: "2024-05-23"})
  @IsOptional()
  @IsString()
  order_date: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  driver_id: string;

}
