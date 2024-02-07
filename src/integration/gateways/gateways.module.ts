import { Module } from '@nestjs/common';
import { OrderGateway } from './order.gateway';
import { SupportTicketGateway } from './support-ticket.gateway';
import { ShipmentChatGateway } from './shipment-chat-gateway';

@Module({
    imports: [],
    providers: [OrderGateway, SupportTicketGateway, ShipmentChatGateway],
    exports: [OrderGateway, SupportTicketGateway, ShipmentChatGateway],
})
export class GatewaysModule { }
