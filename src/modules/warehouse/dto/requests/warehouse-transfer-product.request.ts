import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsNumber, IsString, IsUUID } from "class-validator";


export class WarehouseTransferProductRequest {
    @ApiProperty()
    @IsString()
    @IsUUID()
    warehouse_product_id:string

    @ApiProperty()
    @IsString()
    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    @Transform(({ value }) => Number(value))
    quantity: number;
}

export class WarehouseTransferProductsRequest {
    @ApiProperty({ type: WarehouseTransferProductRequest, isArray: true })
    warehouse_products: WarehouseTransferProductRequest[];
}