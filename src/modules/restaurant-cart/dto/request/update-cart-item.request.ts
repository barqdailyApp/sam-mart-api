import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, Min, IsUUID, IsArray, IsOptional } from "class-validator";

export class UpdateCartMealRequest {
    @ApiProperty()
    @IsOptional()
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    quantity: number;
    @ApiProperty()
    @IsNotEmpty()
    // @IsUUID()
    cart_meal_id: string;
    @ApiProperty({ isArray: true })
    @IsArray()
    @IsOptional()
    // @IsUUID()
    options: string[];
}

