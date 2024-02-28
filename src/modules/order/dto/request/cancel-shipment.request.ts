import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsOptional } from "class-validator";

export class CancelShipmentRequest {
    @ApiProperty({ nullable: true })
    @IsOptional()
    @IsString()
    reason: string;
}