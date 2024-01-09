import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsEnum, IsNotEmpty, IsOptional } from "class-validator";
import { Gender } from "src/infrastructure/data/enums/gender.enum";
import { RegisterRequest } from "src/modules/authentication/dto/requests/register.dto";

export class UpdateProfileRequest extends RegisterRequest {
    @ApiProperty({ required: false })
    @IsOptional()
    first_name: string;

    @ApiProperty({ required: false })
    @IsOptional()
    last_name: string;

    @ApiProperty({ required: false })
    @IsOptional()
    phone: string;

    @ApiProperty({ enum: Gender, required: false })
    @IsEnum(Gender)
    @IsOptional()
    gender: Gender

    @ApiProperty({ default: new Date().toISOString().split('T')[0], required: false })
    @IsOptional()
    birth_date: Date;

    @ApiProperty({ required: false })
    @IsOptional()
    delete_avatar: boolean;

    constructor(data: Partial<UpdateProfileRequest>) {
        super(data)
    }

}