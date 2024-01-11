import { Module } from '@nestjs/common';
import { SupportTicketService } from './support-ticket.service';
import { FileService } from '../file/file.service';
import { SupportTicketController } from './support-ticket.controller';
import { TicketCommentService } from './ticket-comment.service';

@Module({
    controllers: [SupportTicketController],
    providers: [SupportTicketService, TicketCommentService, FileService],
    imports: []
})
export class SupportTicketModule {
}