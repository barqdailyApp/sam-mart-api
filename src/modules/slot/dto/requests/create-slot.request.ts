import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { TimeZone } from 'src/infrastructure/data/enums/time-zone.enum';

export class CreateSlotRequest {
  @ApiProperty({default:"12:00 AM"})
  @IsNotEmpty()
  @IsString()
  start_time: string;

  @ApiProperty({default:"01:00 AM"})
  @IsNotEmpty()
  @IsString()
  end_time: string;

  @ApiProperty({
    enum: Object.values(TimeZone), 
    default:TimeZone.EVENING
    // Use Object.values() to ensure all enum values are included.
  })
  @IsNotEmpty()
  @IsEnum(TimeZone)
  time_zone: TimeZone;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  order_by: number;
  
}
