import { Module } from '@nestjs/common';
import { SupportTicketService } from './support-ticket.service';
import { FileService } from '../file/file.service';
import { SupportTicketController } from './support-ticket.controller';
import { TicketCommentService } from './ticket-comment.service';
import { GatewaysModule } from 'src/integration/gateways/gateways.module';
import { ReasonService } from '../reason/reason.service';
import { NotificationModule } from '../notification/notification.module';

@Module({
    controllers: [SupportTicketController],
    providers: [SupportTicketService, TicketCommentService, FileService, ReasonService],
    imports: [GatewaysModule ,NotificationModule]
})
export class SupportTicketModule {
}