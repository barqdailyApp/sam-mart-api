import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateNewPromoCodeRequest {
  @ApiProperty({ default: new Date().toISOString().split('T')[0] }) //extract only the date
  @IsNotEmpty()
  start_time: Date;

  //* Add 30 days to a Current date For default

  @ApiProperty({
    default: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0], // Add 30 days to today's date
  })
  @IsNotEmpty()
  end_time: Date;

  @ApiProperty({ default: 0.1 })
  @IsNotEmpty()
  @IsNumber()
  discount: number;



  @ApiProperty({ default: 1 })
  @IsNotEmpty()
  @IsNumber()
  max_use_by_users: number;
}
