import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { Unique } from 'src/core/validators/unique-constraints.validator';

export class CreateSupportTicketSubjectRequest {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @Unique('SupportTicketSubject')
    title: string;
}