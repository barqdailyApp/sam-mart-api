import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsString, IsUUID } from "class-validator"

export class AddNoteRequest{
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    note:string

    @ApiProperty()
    @IsNotEmpty()
    @IsUUID()
    order_id:string
}