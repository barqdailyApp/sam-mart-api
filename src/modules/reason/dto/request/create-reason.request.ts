import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsArray, IsEnum, IsNotEmpty, IsString } from "class-validator";
import { IsEnumArray } from "src/core/validators/is-enum-array.validator";
import { ReasonType } from "src/infrastructure/data/enums/reason-type.enum";
import { Role } from "src/infrastructure/data/enums/role.enum";

export class CreateReasonRequest {
    @ApiProperty({ required: true, description: 'Reason name in arabic' })
    @IsNotEmpty()
    @IsString()
    name_ar: string;

    @ApiProperty({ required: true, description: 'Reason name in english' })
    @IsNotEmpty()
    @IsString()
    name_en: string;

    @ApiProperty({
        required: true,
        type: 'enum',
        enum: ReasonType,
        enumName: 'ReasonType',
        description: 'Reason type'
    })
    @IsEnum(ReasonType)
    type: ReasonType;

    @ApiProperty({
        enum: Role,
        isArray: true,
        default: [Role.CLIENT],
        description: 'Roles that can use this reason',
        required: true
    })
    @IsNotEmpty()
    @IsArray()
    @Type(() => String)
    @IsEnumArray(Object.values(Role), {
        message: `roles must be an array of enum values ${Object.values(Role)}`
    })
    roles: Role[]
}