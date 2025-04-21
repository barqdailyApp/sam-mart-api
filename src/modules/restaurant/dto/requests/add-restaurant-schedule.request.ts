import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, Matches } from "class-validator";
import { DayOfWeek } from "src/infrastructure/data/enums/day_of_week.enum";

export class addRestaurantSchedule{
    @ApiProperty({ enum: DayOfWeek })
  @IsEnum(DayOfWeek, { message: 'day_of_week must be a valid day name' })
  day_of_week: DayOfWeek;
    
  @ApiProperty({ example: '09:00' })
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'open_time must be in HH:mm 24-hour format',
  })
  open_time: string;

  @ApiProperty({ example: '22:00' })
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'close_time must be in HH:mm 24-hour format',
  })
  close_time: string;

}
