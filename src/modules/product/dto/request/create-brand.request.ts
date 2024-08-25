import {  ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

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
    
