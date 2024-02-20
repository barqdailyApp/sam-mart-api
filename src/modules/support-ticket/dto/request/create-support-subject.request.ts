import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateSupportTicketSubjectRequest {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    title: string;
}