import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateTermsRequest {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  title_ar: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  description_ar: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  title_en: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  description_en: string;
}
