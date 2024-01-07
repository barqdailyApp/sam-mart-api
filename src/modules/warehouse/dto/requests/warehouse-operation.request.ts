import { ApiProperty } from "@nestjs/swagger"
import { Transform } from "class-transformer"
import { IsEnum, IsNumber, IsString } from "class-validator"
import { operationType } from "src/infrastructure/data/enums/operation-type.enum"

export class WarehouseOperationRequest{
    @ApiProperty ()
    @IsString()
    warehouse_id:string
    @ApiProperty ()
    @IsString()
    product_id:string
    @ApiProperty ()
    @IsNumber ()
    @Transform(({value})=>Number(value))
    quantity:number
    @ApiProperty({type:'enum',enum:[operationType.IMPORT,operationType.EXPORT]})
    @IsEnum(operationType,)
        
    type:operationType
    @ApiProperty()
    @IsString()
    product_measurement_id:string}