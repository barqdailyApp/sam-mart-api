import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class SingleProductRequest {
  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  categorySubCategory_id: string;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  longitude: number;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  latitude: number;
}
