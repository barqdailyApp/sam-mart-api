import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { DayOfWeek } from 'src/infrastructure/data/enums/day_of_week.enum';
import { TimeZone } from 'src/infrastructure/data/enums/time-zone.enum';

export class CreateSlotRequest {
  @ApiProperty({ default: '12:00 AM' })
  @IsNotEmpty()
  @IsString()
  start_time: string;

  @ApiProperty({ default: '01:00 AM' })
  @IsNotEmpty()
  @IsString()
  end_time: string;

  @ApiProperty({
    enum: Object.values(TimeZone),
    default: TimeZone.EVENING,
    // Use Object.values() to ensure all enum values are included.
  })
  @IsNotEmpty()
  @IsEnum(TimeZone)
  time_zone: TimeZone;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  order_by: number;

  @ApiProperty({ enum: DayOfWeek })
  @IsEnum(DayOfWeek, { message: 'day_of_week must be a valid day name' })
  day_of_week: DayOfWeek;
}
