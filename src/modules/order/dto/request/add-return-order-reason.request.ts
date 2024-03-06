import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { Unique } from "src/core/validators/unique-constraints.validator";

export class AddReturnOrderReason {
    @ApiProperty({required: true , example: 'this is return product reason'})
    @IsNotEmpty()
    @IsString()
    @Unique('return_product_reason')
    reason: string;
}