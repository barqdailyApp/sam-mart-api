import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsArray, IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { IsEnumArray } from "src/core/validators/is-enum-array.validator";
import { Unique } from "src/core/validators/unique-constraints.validator";
import { EmployeeDepartement } from "src/infrastructure/data/enums/employee-department.enum";
import { EmployeeStatus } from "src/infrastructure/data/enums/employee-status.enum";
import { Gender } from "src/infrastructure/data/enums/gender.enum";

export class CreateEmployeeRequest {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    name_ar: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    name_en: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsEmail()
    @Unique('User')
    email: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @Unique('User')
    phone: string;

    @ApiProperty({ type: 'file', nullable: true, required: false })
    @IsOptional()
    avatar_file: Express.Multer.File;

    @ApiProperty({ nullable: true, required: false })
    @IsOptional()
    @IsString()
    qualification: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    country_id: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    city_id: string;

    @ApiProperty({
        enum: [Gender.MALE, Gender.FEMALE]
    })
    @IsNotEmpty()
    @IsEnum(Gender)
    gender: Gender;

    @ApiProperty({ nullable: true, required: false, default: true })
    @IsOptional()
    @Transform(({ value }) => {
        return value === 'true' || value === true;
    })
    @IsBoolean()
    is_active: boolean;

    @ApiProperty({ enum: EmployeeDepartement, isArray: true })
    @Transform(({ value }) => JSON.parse(value))
    @IsArray()
    @Type(() => String)
    @IsEnumArray(Object.values(EmployeeDepartement), {
        message: `departements must be an array of enum values ${Object.values(EmployeeDepartement)}`
    })
    departements: EmployeeDepartement[];

}