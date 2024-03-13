import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsOptional, IsUUID } from "class-validator";

export class CancelShipmentRequest {
    @ApiProperty({ nullable: false })
    @IsOptional()
    @IsUUID()
    reason_id: string;
}