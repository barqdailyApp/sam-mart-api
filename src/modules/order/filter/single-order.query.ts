import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class SingleOrderQuery {


  @ApiProperty()
  @IsString()
  order_id: string;
}
