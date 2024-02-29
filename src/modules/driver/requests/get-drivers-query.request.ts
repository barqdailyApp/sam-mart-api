import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsUUID } from "class-validator";

export class GetDriversQueryRequest {
    @ApiProperty({ required: false, description: 'Warehouse id' })
    @IsOptional()
    @IsUUID()
    warehouse_id: string;
}