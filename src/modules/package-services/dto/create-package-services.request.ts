import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatePackageServicesRequest {

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  package_id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  service_id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  service_count: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  is_active: boolean;
}
