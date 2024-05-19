import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class KuraimiPayRequest {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  SCustID: string;

  REFNO: string;

  CRCY: string;
  MRCHNTNAME: string;
  PINPASS: string;

  constructor(data: Partial<KuraimiPayRequest>) {
    Object.assign(this, data);
  }
}
