import { ApiProperty } from '@nestjs/swagger';
import { CreateSectionRequest } from './create-section.request';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { DeliveryType } from 'src/infrastructure/data/enums/delivery-type.enum';
import { Role } from 'src/infrastructure/data/enums/role.enum';

export class UpdateSectionRequest extends CreateSectionRequest {
  @ApiProperty()
  id: string;

  @ApiProperty({ required: false })
  @IsString()
  name_ar: string;
  @ApiProperty({ required: false })
  @IsString()
  name_en: string;

  @ApiProperty({ type: 'file', required: false })
  logo: Express.Multer.File;

  @ApiProperty({ required: false })
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  order_by: number;

  @ApiProperty({ required: false })
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  min_order_price: number;

  @ApiProperty({ required: false })
  is_active: boolean;

  @ApiProperty({ required: false })
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  delivery_price: number;

  @ApiProperty({
    required: false,
    default: DeliveryType['SCHEDULED&FAST'],
    enum: [
      DeliveryType.FAST,
      DeliveryType.SCHEDULED,
      DeliveryType['SCHEDULED&FAST'],
    ],
  })
  @IsNotEmpty()
  @IsEnum(DeliveryType)
  delivery_type: DeliveryType;

  @ApiProperty({ required: false, enum: [Role.CLIENT, Role.RESTURANT] })
  @IsNotEmpty()
  @IsEnum(Role, {
    each: true,
    message: 'Invalid role. Allowed values: admin, user, moderator',
  })
  allowed_roles: Role[];
}
