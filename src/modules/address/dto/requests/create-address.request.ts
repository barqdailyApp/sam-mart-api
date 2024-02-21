import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Matches,
} from 'class-validator';

export class CreateAddressRequest {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Matches(
    /^(\+|-)?(?:90(?:(?:\.0{1,15})?)|(?:[0-9]|[1-8][0-9])(?:(?:\.[0-9]{1,15})?))$/,
    { message: 'invalid value for latitude' },
  )
  latitude: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Matches(
    /^(\+|-)?(?:180(?:(?:\.0{1,15})?)|(?:[0-9]|[1-9][0-9]|1[0-7][0-9])(?:(?:\.[0-9]{1,15})?))$/,
    { message: 'invalid value for longitude' },
  )
  longitude: string;

  @ApiProperty({required :false})
  @IsOptional()
  @IsBoolean()
  is_favorite?: boolean;


  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone: string;

}
