import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Unique } from 'src/core/validators/unique-constraints.validator';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { vehicle_types } from 'src/infrastructure/data/enums/vehicle_type.enum';
export class DriverRegisterRequest {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  @Unique('User')
  email?: string;

  @ApiProperty()
  @IsNotEmpty()
  @Unique('User')
  phone: string;

  @ApiProperty({ type: 'file' })
  avatarFile: Express.Multer.File;

  @ApiProperty({ default: Role.CLIENT, enum: [Role.CLIENT, Role.DRIVER] })
  @IsNotEmpty()
  @IsEnum(Role)
  role: Role;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  country_id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  region_id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  latitude: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  longitude: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  id_card_number: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  id_card_image: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  license_number: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  license_image: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  vehicle_color: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  vehicle_model: string;
  
  @ApiProperty({enum: [vehicle_types.SADAN, vehicle_types.TRUCK,vehicle_types.VAN]})
  @IsNotEmpty()
  @IsEnum(vehicle_types)
  vehicle_type: vehicle_types;
}
