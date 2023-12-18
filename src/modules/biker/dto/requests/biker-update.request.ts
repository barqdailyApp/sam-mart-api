import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateBikerRequest {
  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  first_name: string;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  last_name: string;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  phone: string;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  email: string;

  @ApiProperty({ type: 'file', nullable: true, required: false })
  file: Express.Multer.File;
}
