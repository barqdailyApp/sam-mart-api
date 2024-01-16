import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { TimeZone } from 'src/infrastructure/data/enums/time-zone.enum';

export class UpdateSlotRequest {
  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  start_time: string;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  end_time: string;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsNumber()
  order_by: number;

  @ApiProperty({ nullable: true, required: false, enum: TimeZone })
  @IsOptional()
  @IsEnum(TimeZone)
  time_zone: TimeZone;
}
