import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { CreateCategoryRequest } from "./create-category-request";

export class UpdateCategoryRequest extends CreateCategoryRequest {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    id: string;


    @ApiProperty({required  : false})
    @IsNotEmpty()
    @IsString()
    name_ar: string;
    @ApiProperty({required  : false})
    @IsNotEmpty()
    @IsString()
    name_en: string;
    @ApiProperty({required  : false})
    logo: Express.Multer.File;
  }