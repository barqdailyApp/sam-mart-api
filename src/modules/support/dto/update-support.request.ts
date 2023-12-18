import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateSupportRequest {
  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  whatsApp_phone: string;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  phone_number: string;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  mail_us: string;


}
