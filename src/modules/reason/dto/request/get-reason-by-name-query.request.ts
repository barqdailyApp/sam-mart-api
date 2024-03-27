import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { toRightNumber } from "src/core/helpers/cast.helper";

export class GetReasonByNameQueryRequest {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string;

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