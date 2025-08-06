import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateRestaurantKeywords {
  @ApiProperty()
  @IsString()
  name_ar: string;
  @ApiProperty()
  @IsString()
  name_en: string;
}


export class UpdateRestaurantKeywords {
  @ApiProperty()
  @IsString()
  id: string
  @ApiProperty({required:false})
  @IsOptional()
  @IsString()
  name_ar: string;
  @ApiProperty({required:false})
  @IsOptional()
  @IsString()
  name_en: string;
}
