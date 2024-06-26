import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
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
    default: [DeliveryType.FAST],
    enum: [DeliveryType.FAST, DeliveryType.SCHEDULED, DeliveryType.WAREHOUSE_PICKUP],
    isArray: true,
  })
  @IsNotEmpty()

  delivery_type: DeliveryType[];
  @ApiProperty({ required: false, enum: [Role.CLIENT, Role.RESTURANT] })
  @IsNotEmpty()
  @IsEnum(Role, {
    each: true,
    message: 'Invalid role. Allowed values: admin, user, moderator',
  })
  allowed_roles: Role[];
}
