import { th } from '@faker-js/faker';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Unique } from 'src/core/validators/unique-constraints.validator';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { CreateAddressRequest } from 'src/modules/address/dto/requests/create-address.request';

export class RegisterRequest {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;
  
  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  @IsEmail()
  email?: string;

  @ApiProperty()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ type: 'file', required: false })
  @IsOptional()
  avatarFile: Express.Multer.File;

  // @ApiProperty({ default: Role.CLIENT, enum: [Role.CLIENT, Role.DRIVER] })
  // @IsNotEmpty()
  // @IsEnum(Role)
  // role: Role;

  @ApiPropertyOptional({isArray:true,})
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateAddressRequest)
  address:CreateAddressRequest[]
  
  constructor(data:Partial<RegisterRequest>){
    Object.assign(this,data)
  }
}
