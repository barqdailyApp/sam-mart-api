import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsUUID, Validate, ValidateNested } from "class-validator";

export class AddMealRestaurantCartRequest  {
    @ApiProperty()
    @IsUUID()
    @IsNotEmpty()
    meal_id: string

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    quantity: number

    // list of meal option group ids
    @ApiProperty({isArray: true})
    @IsOptional()
    @IsUUID('all', {each: true})
    meal_option_group_ids?: string[]
}

