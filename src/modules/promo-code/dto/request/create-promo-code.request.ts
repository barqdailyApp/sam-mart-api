import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsDate, IsNumber, IsString } from "class-validator";

export class CreatePromoCodeRequest {
    @ApiProperty()
    @IsString()
    code: string;
    @ApiProperty()
    @IsNumber()
    @Transform(({ value }) => Number(value))
    discount: number;
    @ApiProperty()
    @IsDate()
    @Transform(({ value }) => new Date(value))
    expire_at: Date;
    @ApiProperty()
    @IsNumber()
    number_of_uses: number;
}