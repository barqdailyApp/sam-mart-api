import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {

  IsNumber,

} from 'class-validator';


export class GiftFilterRequest {
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

}
