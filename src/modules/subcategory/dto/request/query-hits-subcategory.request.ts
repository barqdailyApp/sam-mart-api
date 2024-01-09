import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNumber, IsOptional } from "class-validator";
import { toRightNumber } from "src/core/helpers/cast.helper";

export class QueryHitsSubCategoryRequest {
    @Transform(({ value }) => toRightNumber(value, { min: 1 }))
    @ApiProperty({ required: false, minimum: 1 })
    @IsOptional()
    @IsNumber()
    page: number;
  
    @Transform(({ value }) => toRightNumber(value, { min: 1 }))
    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    limit: number;

    @ApiProperty({ required: false })
    @IsOptional()
    section_category_id: string;

    @ApiProperty({ required: false })
    @IsOptional()
    section_id: string;

    constructor(partial) {
        Object.assign(this, partial);
    }
}