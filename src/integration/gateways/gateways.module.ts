import { Module } from '@nestjs/common';
import { OrderGateway } from './order.gateway';
import { SupportTicketGateway } from './support-ticket.gateway';
import { ShipmentChatGateway } from './shipment-chat-gateway';
import { FastDeliveryGateway } from './fast-delivery.gatewau';

@Module({
    imports: [],
    providers: [
        OrderGateway,
        SupportTicketGateway,
        ShipmentChatGateway,
        FastDeliveryGateway
    ],
    exports: [
        OrderGateway,
        SupportTicketGateway,
        ShipmentChatGateway,
        FastDeliveryGateway
    ],
})
export class GatewaysModule { }
