import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsNumber, IsString } from "class-validator";


export class AddCuisineRequest {
    @ApiProperty()
    @IsString()
    name_ar: string;
    @ApiProperty()
    @IsString()
    name_en: string;
    @ApiProperty()
    @IsString()
    logo: string;
    @ApiProperty()
    @IsBoolean()
    is_active: boolean;
    @ApiProperty()
    @IsNumber()
    @Transform(({ value }) => Number(value))
    order_by: number;
}