import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateRestaurantKeywords {
  @ApiProperty()
  @IsString()
  name_ar: string;
  @ApiProperty()
  @IsString()
  name_en: string;
}
