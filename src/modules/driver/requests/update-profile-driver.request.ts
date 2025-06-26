import { DriverType } from '@codebrew/nestjs-storage';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { DriverStatus } from 'src/infrastructure/data/enums/driver-status.enum';
import { DriverTypeEnum } from 'src/infrastructure/data/enums/driver-type.eum';
import { Language } from 'src/infrastructure/data/enums/language.enum';
import { UserStatus } from 'src/infrastructure/data/enums/user-status.enum';
import { vehicle_types } from 'src/infrastructure/data/enums/vehicle_type.enum';

export class UpdateProfileDriverRequest {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  driver_id: string;

  @ApiProperty({ nullable: true, required: false ,})
  @IsOptional()
  @IsString()
  name: string;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  email: string;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  phone: string;

  @ApiProperty({ type: 'file', nullable: true, required: false })
  @IsOptional()
  avatarFile: Express.Multer.File;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  birth_date: string;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  country_id: string;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  city_id: string;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  region_id: string;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  id_card_number: string;

  @ApiProperty({ type: 'file', nullable: true, required: false })
  @IsOptional()
  id_card_image: Express.Multer.File;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  license_number: string;

  @ApiProperty({ type: 'file', nullable: true, required: false })
  @IsOptional()
  license_image: Express.Multer.File;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  vehicle_color: string;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  vehicle_model: string;

  @ApiProperty({
    nullable: true,
    required: false,
    enum: [vehicle_types.SADAN, vehicle_types.TRUCK, vehicle_types.VAN],
  })
  @IsOptional()
  vehicle_type: vehicle_types;

    @ApiProperty({
    nullable: true,
    required: false,
    enum: [DriverTypeEnum.FOOD, DriverTypeEnum.MART],
  })
  @IsOptional()
  type: DriverTypeEnum;
}
