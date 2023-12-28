import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateMeasurementUnitRequest {
    @ApiProperty({nullable: true,required:false})
    @IsOptional()
    @IsString()
    name_ar: string;

    @ApiProperty({nullable: true,required:false})
    @IsOptional()
    @IsString()
    name_en: string;

    @ApiProperty({nullable: true,required:false})
    @IsOptional()
    @IsString()
    abbreviation: string;

}