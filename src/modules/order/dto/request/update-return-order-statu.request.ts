import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Validate, ValidateNested } from "class-validator";
import { ReturnOrderStatus } from "src/infrastructure/data/enums/return-order-status.enum";
import { ValidateIf } from 'class-validator';

class UpdateReturnProductStatusRequest {
    @ApiProperty()
    @IsNotEmpty()
    @IsUUID()
    return_order_product_id: string;

    @ApiProperty({ type: 'enum', enum: ReturnOrderStatus })
    @IsNotEmpty()
    @IsEnum(ReturnOrderStatus)
    status: ReturnOrderStatus;

    @ApiProperty({ type: 'number' })
    @IsNotEmpty()
    @IsNumber()
    accepted_quantity: number;

    @ApiProperty({ nullable: true })
    @IsOptional()
    @IsString()
    admin_note: string;
}

export class UpdateReturnOrderStatusRequest {
    @ApiProperty({ type: [UpdateReturnProductStatusRequest] })
    @IsNotEmpty()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateReturnProductStatusRequest)
    return_order_products: UpdateReturnProductStatusRequest[];

    @ApiProperty({ type: 'enum', enum: ReturnOrderStatus })
    @IsNotEmpty()
    @IsEnum(ReturnOrderStatus)
    status: ReturnOrderStatus;

    @ApiProperty({ nullable: true })
    @IsOptional()
    @IsString()
    admin_note: string;

    @ApiProperty({ nullable: true })
    @ValidateIf((obj) => obj.status === ReturnOrderStatus.ACCEPTED)
    @IsNotEmpty()
    @IsUUID()
    driver_id: string;
}