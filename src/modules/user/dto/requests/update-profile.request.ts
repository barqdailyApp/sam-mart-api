//UpdateProfile request
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, } from "class-validator";
import { Unique } from "src/core/validators/unique-constraints.validator";

export class UpdateProfileRequest {
    
        @ApiProperty() @IsNotEmpty() @IsString()
        first_name: string;
        @ApiProperty() @IsNotEmpty() @IsString()
        last_name: string;
        @ApiPropertyOptional()
        @IsOptional()
        @IsNotEmpty()
        @IsEmail()
        email:string

        @ApiProperty({ type: 'file', required: false })
        @IsOptional()
        file: Express.Multer.File;
        @ApiProperty() @Transform(({ value} ) => value === 'true') @IsBoolean()
        delete_avatar: boolean;


    
    }