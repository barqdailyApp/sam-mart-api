import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsUUID, Min, Validate, ValidateNested } from "class-validator";

export class AddMealRestaurantCartRequest  {
    @ApiProperty()
    // @IsUUID()
    @IsNotEmpty()
    meal_id: string

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    @Min(1)
    quantity: number

    // list of meal option group ids
    @ApiProperty({isArray: true})
    @IsOptional()
    // @IsUUID('all', {each: true})
    options_ids?: string[]
}

