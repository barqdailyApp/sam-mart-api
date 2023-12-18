import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdatePackageServicesRequest {

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  package_id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  service_id: string;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsNumber()
  service_count: number;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsBoolean()
  is_active: boolean;
}
