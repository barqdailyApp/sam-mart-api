import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class SendToUsersRequest {
  @ApiProperty()
  @IsNotEmpty()
  @IsArray()
  users_id: string[];

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  points: number;

}
