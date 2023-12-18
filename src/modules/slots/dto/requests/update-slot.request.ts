import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateSlotRequest {

  
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsNumber()
  start_time: number;
  
  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsNumber()
  end_time: number;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  name: string;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsNumber()
  order_by: number;


  
    @ApiProperty({ nullable: true, required: false })
  @IsOptional()

  in_active_start_date:Date;
  @ApiProperty({ nullable: true, required: false })
  @IsOptional()

  in_active_end_date:Date;
}
