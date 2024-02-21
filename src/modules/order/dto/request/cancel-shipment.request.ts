import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CancelShipmentRequest{
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    reason: string;
}