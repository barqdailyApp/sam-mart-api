import { IsNotEmpty, IsNumber, Min, IsUUID } from "class-validator";

export class UpdateCartItemQuantityRequest {
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    quantity: number;
    @IsNotEmpty()
    // @IsUUID()
    cart_meal_id: string;
}

export class UpdateCartItemOptionRequest {
    @IsNotEmpty()
    // @IsUUID()
    cart_meal_id: string;
    @IsNotEmpty()
    // @IsUUID()
    cart_meal_option_id: string;
}