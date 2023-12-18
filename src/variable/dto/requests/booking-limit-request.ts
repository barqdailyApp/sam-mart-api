import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNumber } from "class-validator";

export class BookingLimitRequest{


 @ApiProperty()   

 @Transform(({ value }) => value.toString())
 booking_limit_in_days:string
}