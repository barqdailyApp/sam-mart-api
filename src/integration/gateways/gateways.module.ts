import { Module } from '@nestjs/common';
import { OrderGateway } from './order.gateway';
import { SupportTicketGateway } from './support-ticket.gateway';

@Module({
    imports: [],
    providers: [OrderGateway, SupportTicketGateway],
    exports: [OrderGateway,SupportTicketGateway],
})
export class GatewaysModule { }
