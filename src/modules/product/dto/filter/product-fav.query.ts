import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class ProductFavQuery {
  @ApiProperty({ required: false, default: 1 })
  @Transform(({ value }) => {
    return Number(value);
  })
  @IsNumber()
  page: number;

  @ApiProperty({ required: false, default: 10 })
  @Transform(({ value }) => {
    return Number(value);
  })
  @IsNumber()
  limit: number;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  longitude: string;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  latitude: string;

  @ApiProperty()
  @IsString()
  section_id: string;


  @ApiProperty({ required: false, enum: ['lowest_price', 'highest_price', 'new'], default: 'new' })
  @IsOptional()
  @IsString()
  sort: 'lowest_price' | 'highest_price' | 'new';

  @ApiProperty()
  @IsString()
  user_id: string;
}
