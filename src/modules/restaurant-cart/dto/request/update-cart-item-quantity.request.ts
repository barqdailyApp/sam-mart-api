import { IsNotEmpty, IsNumber, Min, IsUUID } from "class-validator";

export class UpdateCartItemQuantityRequest {
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    quantity: number;
    @IsNotEmpty()
    @IsUUID()
    cart_meal_id: string;
}