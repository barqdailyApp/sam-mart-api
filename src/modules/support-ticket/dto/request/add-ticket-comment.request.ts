import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class AddTicketCommentRequest {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    comment_text: string;

    @ApiProperty({ type: 'file', required: false })
    @IsOptional()
    file?: Express.Multer.File;
}