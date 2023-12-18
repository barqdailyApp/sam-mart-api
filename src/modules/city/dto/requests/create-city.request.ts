import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateCityRequest {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    
    name_ar: string;
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    name_en: string;

}