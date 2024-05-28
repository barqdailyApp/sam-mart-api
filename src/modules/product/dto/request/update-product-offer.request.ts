import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsEnum,
} from 'class-validator';
import { DiscountType } from 'src/infrastructure/data/enums/discount-type.enum';

export class UpdateProductOfferRequest {


  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  start_date: Date;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  end_date: Date;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsNumber()
  offer_quantity: number;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsNumber()
  min_offer_quantity: number;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsNumber()
  order_by:number;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsNumber()
  max_offer_quantity: number;

  @ApiProperty({
    nullable: true,
    required: false,
    enum: DiscountType,
    description: 'Type of the Discount',
    default: DiscountType.PERCENTAGE,
  })
  @IsOptional()
  @IsEnum(DiscountType)
  discount_type: DiscountType;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsNumber()
  discount_value: number;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @Transform(({ value }) => {
    return value === 'true' || value === true;
  })
  @IsBoolean()
  is_active: boolean;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  description_ar: string;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  description_en: string;
}
