import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEnum, IsNumber, IsOptional } from "class-validator";
import { toRightNumber } from "src/core/helpers/cast.helper";
import { ReasonType } from "src/infrastructure/data/enums/reason-type.enum";

export class GetReasonQueryRequest {
    @ApiProperty({
        required: true,
        type: 'enum',
        enum: ReasonType,
        enumName: 'ReasonType',
        description: 'Reason type'
    })
    @IsEnum(ReasonType)
    type: ReasonType;

    @Transform(({ value }) => toRightNumber(value, { min: 1 }))
    @ApiProperty({ required: false, minimum: 1 })
    @IsOptional()
    @IsNumber()
    page: number = 1;

    @Transform(({ value }) => toRightNumber(value, { min: 1 }))
    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    limit: number = 5;
}