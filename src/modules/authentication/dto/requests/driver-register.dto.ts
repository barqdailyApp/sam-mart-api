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

  @ApiProperty({
    type: String,
    format: 'date',
    example: '1990-01-01',
  })
  @IsNotEmpty()
  @IsString()
  birth_date: string;


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

  @ApiProperty({type: 'double precision',})
  @IsNotEmpty()
  latitude: number;

  @ApiProperty({type: 'double precision',})
  @IsNotEmpty()
  longitude: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  id_card_number: string;


  @ApiProperty({ type: 'file' })
  id_card_image: Express.Multer.File;


  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  license_number: string;
  
  @ApiProperty({ type: 'file' })
  license_image: Express.Multer.File;

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
