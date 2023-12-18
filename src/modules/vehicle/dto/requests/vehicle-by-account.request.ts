import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class VehicleByAccountRequest {
    @ApiProperty({ required: false })
    @IsNotEmpty()
    account: string;
}