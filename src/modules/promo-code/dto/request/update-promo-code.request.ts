import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsDate, IsNumber, IsOptional, IsString } from "class-validator";

export class UpdatePromoCodeRequest {
    @ApiProperty()
    @IsOptional()
    @IsString()
    code: string;
    @ApiProperty()
    @IsNumber()
    @IsOptional()
    @Transform(({ value }) => Number(value))
    discount: number;
    @ApiProperty()
    @IsOptional()
    @IsDate()
    @Transform(({ value }) => new Date(value))
    expire_at: Date;
    @ApiProperty()
    @IsOptional()
    @IsNumber()
    number_of_uses: number;
}