import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class OrderClientQuery {
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

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  client_id: string;
}
