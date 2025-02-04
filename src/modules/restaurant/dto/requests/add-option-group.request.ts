import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNumber, IsString, Min } from "class-validator";
import { Transform } from "class-transformer";

export class AddOptionRequest{
    @ApiProperty()
    @IsString()
    name_ar: string;

    @ApiProperty()
    @IsString()
    name_en: string;

    @ApiProperty()
    @IsBoolean()
    is_active: boolean;

    @ApiProperty()
    @IsNumber()
    @Min(0)
    @Transform(({ value }) => Number(value))
    price: number;

}

export class AddOptionGroupRequest {
    @ApiProperty()
    @IsString()
    name_ar: string;

    @ApiProperty()
    @IsString()
    name_en: string;

    @ApiProperty()
    @IsBoolean()
    is_active: boolean;

    @ApiProperty()
    @IsNumber()
    @Min(1)
    @Transform(({ value }) => Number(value))
    min_selection: number;

    @ApiProperty()
    @IsNumber()
    @Min(1)
    @Transform(({ value }) => Number(value))
    max_selection: number;

    // add list of option
    @ApiProperty({type: [AddOptionRequest]})
    options: AddOptionRequest[]
}