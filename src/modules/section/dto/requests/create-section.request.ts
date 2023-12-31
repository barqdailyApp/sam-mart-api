import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { DeliveryType } from 'src/infrastructure/data/enums/delivery-type.enum';

import { Role } from 'src/infrastructure/data/enums/role.enum';
import { CreateCategoryRequest } from 'src/modules/category/dto/requests/create-category-request';

export class CreateSectionRequest extends CreateCategoryRequest {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  order_by: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  min_order_price: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  delivery_price: number;

  @ApiProperty({
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

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(Role, {
    each: true,
    message: 'Invalid role. Allowed values: admin, user, moderator',
  })
  allowed_roles: Role[];
}
