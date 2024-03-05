import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";

class ReturnShipmentProductRequest {
    @ApiProperty()
    @IsNotEmpty()
    @IsUUID()
    shipment_product_id: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsUUID()
    reason_id: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    quantity: number;
}

export class ReturnOrderRequest {
    @ApiProperty({ type: [ReturnShipmentProductRequest] })
    @IsNotEmpty()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ReturnShipmentProductRequest)
    returned_shipment_products: ReturnShipmentProductRequest[];

    @ApiProperty({nullable: true})
    @IsOptional()
    @IsString()
    customer_note: string;
}