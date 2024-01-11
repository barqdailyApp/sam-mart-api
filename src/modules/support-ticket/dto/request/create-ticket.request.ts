import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateTicketRequest {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    subject: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    description: string;

    @ApiProperty({ type: 'file', required: false })
    @IsOptional()
    file?: Express.Multer.File;
}