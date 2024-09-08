import {  ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateBrandRequest {
    @ApiProperty()
    @IsString()
    name_en: string;

    @ApiProperty()
    @IsString()
    name_ar: string;

    @ApiProperty({ nullable: true, required: false })
    @IsOptional()
    @Transform(({ value }) => {
      return value === 'true'  || value === true;
    })
    @IsBoolean()
    is_active: boolean;

    @ApiProperty({required:false})
    @IsOptional()
    
    @Transform(({ value }) => Number(value))
    @IsNumber()
    order:number

    @ApiProperty({ type: 'file', required: true })
    logo: Express.Multer.File;
}
    

export class UpdateBrandRequest {

    @ApiProperty()
    @IsString()
    id: string;
    @ApiProperty({required:false})
    @IsOptional()
    @IsString()
    name_en: string;

    @ApiProperty({required:false})
    @IsOptional()
    @IsString()
    name_ar: string;

    @ApiProperty({required:false})
    @IsOptional()
    @IsNumber()
    
    @Transform(({ value }) => Number(value))
    order:number

    @ApiProperty({ nullable: true, required: false })
    @IsOptional()
    @Transform(({ value }) => {
      return value === 'true'  || value === true;
    })
    @IsBoolean()
    is_active: boolean;
    
    @ApiProperty({ type: 'file', required: false })
    @IsOptional()
    logo: Express.Multer.File;
}

export class LinkBrandProuductRequest {

    @ApiProperty()
    @IsString()
    brand_id: string;
    @ApiProperty({required:false,isArray:true})
    @IsArray()
    product_ids: string[];


    
}
