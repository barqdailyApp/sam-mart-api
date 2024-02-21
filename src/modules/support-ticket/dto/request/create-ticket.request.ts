import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateTicketRequest {
    @ApiProperty()
    @IsNotEmpty()
    @IsUUID()
    subject_id: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    description: string;

    @ApiProperty({ type: 'file', required: false })
    @IsOptional()
    file?: Express.Multer.File;
}