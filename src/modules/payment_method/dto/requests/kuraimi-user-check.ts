import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

export class KuraimiUserCheckRequest {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  // @IsNotEmpty()
  // @ValidateIf((object, value) => {
  //   // Validate if both SCustID and MobileNumber are null
  //   return object.Email == null && object.MobileNumber == null;
  // })
  SCustID: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsNotEmpty()
  @ValidateIf((object, value) => {
    // Validate if both SCustID and MobileNumber are null
    return object.SCustID === null && object.Email === null;
  })
  MobileNo: string;

  @ApiProperty({ required: false })
  @IsOptional()
  // @ValidateIf((object, value) => {
  //   // Validate if both SCustID and MobileNumber are null
  //   return object.SCustID === null && object.MobileNumber === null;
  // })
  // @IsEmail()
  Email: string;

  @IsNotEmpty()
  @ApiProperty()
  @IsString()
  CustomerZone: string;
}
