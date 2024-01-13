import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { DiscountType } from 'src/infrastructure/data/enums/discount-type.enum';

export class CreateProductOfferRequest {
  @ApiProperty({ default: new Date().toISOString().split('T')[0] }) //extract only the date
  @IsNotEmpty()
  start_date: Date;

  //* Add 30 days to a Current date For default
  @ApiProperty({
    default: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0], // Add 30 days to today's date
  })
  @IsNotEmpty()
  end_date: Date;


  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  offer_quantity: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  min_offer_quantity: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  max_offer_quantity: number;

  @ApiProperty({
    enum: DiscountType,
    description: 'Type of the Discount',
    default: DiscountType.PERCENTAGE,
  })
  @IsNotEmpty()
  @IsEnum(DiscountType)
  discount_type: DiscountType;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  discount_value: number;

  @ApiProperty({ default: true })
  @IsNotEmpty()
  @Transform(({ value }) => {
    return value === 'true' || value === true;
  })
  @IsBoolean()
  is_active: boolean;
}
