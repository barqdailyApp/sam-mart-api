import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class AddShipmentChatMessageRequest {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    message: string;

    @ApiProperty({ type: 'file', required: false })
    @IsOptional()
    file?: Express.Multer.File;
}