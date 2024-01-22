import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { CreateCategoryRequest } from "./create-category-request";

export class UpdateCategoryRequest extends CreateCategoryRequest {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    id: string;


    @ApiProperty({required  : false})
    @IsOptional()
  
    name_ar: string;


    
    @ApiProperty({required  : false})
    @IsOptional()

    name_en: string;
    
    @ApiProperty({required  : false})
    logo: Express.Multer.File;
  }