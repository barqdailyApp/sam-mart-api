import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsOptional, Matches } from "class-validator";
import { DayOfWeek } from "src/infrastructure/data/enums/day_of_week.enum";

export class updateRestaurantScheduleRequest {

    @ApiProperty({ example: 'restaurant_schedule_id' })
    @IsNotEmpty()
    id: string
      @ApiProperty({ enum: DayOfWeek })
      @IsOptional()
    @IsEnum(DayOfWeek, { message: 'day_of_week must be a valid day name' })
    day_of_week: DayOfWeek;
      
    @ApiProperty({ example: '09:00' })
   
    @IsOptional()
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
      message: 'open_time must be in HH:mm 24-hour format',
    })
    open_time: string;
  
    @ApiProperty({ example: '22:00' })
   
    @IsOptional()
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
      message: 'close_time must be in HH:mm 24-hour format',
    })
    close_time: string;
  
   
}