import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class EditPaymentMethodRequest {
  @ApiProperty()
  id: string;
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name_ar: string;
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name_en: string;

  @ApiProperty({ type: 'file', required: false })
  @IsOptional()
  logo: Express.Multer.File;
  @ApiProperty({ required: false })
  @Transform(({ value }) => Boolean(value))
  @IsBoolean()
  @IsOptional()
  is_active: boolean;

  constructor(data: Partial<EditPaymentMethodRequest>) {
    Object.assign(this, data);
  }
}
