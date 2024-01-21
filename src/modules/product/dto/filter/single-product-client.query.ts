import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class SingleProductClientQuery {
  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  longitude: string;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  latitude: string;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  section_id: string;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  category_sub_category_id: string;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  user_id: string;
}
