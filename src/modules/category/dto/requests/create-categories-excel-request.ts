import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsOptional, IsString, IsUrl, ValidateNested } from "class-validator";

export class CreateCategoriesExcelRequest {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateCategoryExcelRequest)
    categories: CreateCategoryExcelRequest[];
}

export class CreateCategoryExcelRequest {
    @IsNotEmpty()
    @IsString()
    name_ar: string;

    @IsNotEmpty()
    @IsString()
    name_en: string;

    @IsOptional()
    @IsString()
    logo: string;
}