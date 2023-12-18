import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class SendGiftRequest {
  @ApiProperty()
  @IsString()
  package_id: string;

  @ApiProperty()
  @IsString()
  receiver_phone_number?: string;

  @ApiPropertyOptional()
  services?: string[];

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  promo_code_id?: string;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  message?: string;

  is_new_user?: boolean;
}
