import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateSocialRequest {
 
  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  icon: string;


  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  link: string;

  
  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  scheme: string;
}
