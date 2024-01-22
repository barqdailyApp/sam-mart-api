import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional } from "class-validator";
import { CreateWarehouseRequest } from "./create-warehouse.request";

export class UpdateWarehouseRequest extends CreateWarehouseRequest {
    @ApiPropertyOptional()
    @IsOptional()
    name_ar: string;

    @ApiPropertyOptional()
    @IsOptional()
    name_en: string;

    @ApiPropertyOptional()
    @IsOptional()
    region_id: string;

    @ApiPropertyOptional()
    @IsOptional()
    latitude: string;

    @ApiPropertyOptional()
    @IsOptional()
    longitude: string;
}