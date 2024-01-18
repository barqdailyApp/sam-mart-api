import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional } from "class-validator";
import { toRightNumber } from "src/core/helpers/cast.helper";

export class GetCommentQueryRequest {
    @Transform(({ value }) => toRightNumber(value, { min: 0 }))
    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    offset: number = 0;

    @Transform(({ value }) => toRightNumber(value, { min: 1 }))
    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    limit: number;
}