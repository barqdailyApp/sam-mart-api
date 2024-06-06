import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

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
  @ApiProperty({ required: false })
  @IsNumber()
  @Transform(({ value }) => Number(value))
  @Min(1)
  @IsOptional()
  order_by: number;

  @ApiProperty({ type: 'file', required: false })
  @IsOptional()
  logo: Express.Multer.File;

  @ApiProperty({ required: false })
  @Transform(({ value }) => Boolean(value === 'true'))
  @IsBoolean()
  @IsOptional()
  is_active: boolean;

  constructor(data: Partial<EditPaymentMethodRequest>) {
    Object.assign(this, data);
  }
}
