import {  ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class CreateBrandRequest {
    @ApiProperty()
    @IsString()
    name_en: string;

    @ApiProperty()
    @IsString()
    name_ar: string;

    @ApiProperty({ type: 'file', required: true })
    logo: Express.Multer.File;
}
    

export class UpdateBrandRequest {
    @ApiProperty({required:false})
    @IsOptional()
    @IsString()
    name_en: string;

    @ApiProperty({required:false})
    @IsOptional()
    @IsString()
    name_ar: string;

    @ApiProperty({ type: 'file', required: false })
    @IsOptional()
    logo: Express.Multer.File;
}
