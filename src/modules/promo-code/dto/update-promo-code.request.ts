import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsNotEmpty, IsDate } from 'class-validator';

export class UpdatePromoCodeRequest {
  @ApiProperty({
    nullable: true,
    required: false,
    default: new Date().toISOString().split('T')[0],
  }) //extract only the date
  @IsOptional()
  start_time: Date;

  @ApiProperty({
    nullable: true,
    required: false,
    default: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
  })
  @IsOptional()
  end_time: Date;

  @ApiProperty({ default: 0.1, nullable: true, required: false })
  @IsOptional()
  @IsNumber()
  discount: number;



  @ApiProperty({ default: 1, nullable: true, required: false })
  @IsOptional()
  @IsNumber()
  max_use_by_users: number;
}
