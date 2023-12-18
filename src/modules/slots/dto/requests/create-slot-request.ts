import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';
import { IsUnique } from 'src/core/validators/unique-constraints.validator';
import { Unique } from 'typeorm';

export class CreateSlotRequest {

  @ApiProperty()
  @Max(23)
  @Min(0)
  start_time: number;

  @ApiProperty()
  @Max(23)
  @Min(0)
  end_time: number;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNumber()
  order_by: number;
}
