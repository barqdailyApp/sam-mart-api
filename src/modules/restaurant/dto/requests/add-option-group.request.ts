import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { Transform } from "class-transformer";

export class AddOptionRequest{
    @ApiProperty()
    @IsString()
    name_ar: string;

    @ApiProperty()
    @IsString()
    name_en: string;

    //is active
    @ApiProperty()
    @IsOptional()
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
    @IsNumber()
    @Min(0)
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

export class UpdateOptionGroupRequest {

    @ApiProperty()
    @IsOptional()
    @IsString()
    id: string;   
    @ApiProperty()
    @IsOptional()
    @IsString()
    name_ar: string;    

    @ApiProperty()
    @IsOptional()
    @IsString()
    name_en: string;



    @ApiProperty()
    @IsNumber()
    @IsOptional()
    @Min(0)
    @Transform(({ value }) => Number(value))
    min_selection: number;

    @ApiProperty()
    @IsNumber()
    @IsOptional()
    @Min(1)
    @Transform(({ value }) => Number(value))
    max_selection: number;


}


export class UpdateOptionRequest{

    @ApiProperty()
    @IsOptional()
    @IsString()
    id: string;   
    @ApiProperty()
    @IsOptional()
    @IsString()
    name_ar: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    name_en: string;

    @ApiProperty()
    @IsOptional()
    @IsBoolean()
    is_active: boolean;

    @ApiProperty()
    @IsNumber()
    @IsOptional()
    @Min(0)
    @Transform(({ value }) => Number(value))
    price: number;


}
export class CreateOptionRequest extends AddOptionRequest{
    @ApiProperty()
    @IsString()
    option_group_id: string
}