import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsString,
  Matches,
  isArray,
} from 'class-validator';
import { OrderImageType } from 'src/infrastructure/data/enums/order-image.enum';

export class OrderFinishRequest {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  id_order: string;

  @ApiProperty({ type: 'file', required: true })
  file: Express.Multer.File;

  @ApiProperty()
  @IsNotEmpty()
  @IsIn([OrderImageType.BEFORE, OrderImageType.AFTER])
  status: OrderImageType;
}
