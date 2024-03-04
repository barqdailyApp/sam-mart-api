import { Module } from '@nestjs/common';
import { OrderGateway } from './order.gateway';
import { SupportTicketGateway } from './support-ticket.gateway';
import { ShipmentChatGateway } from './shipment-chat-gateway';
import { DriverShipmentGateway } from './driver-shipment.gateway';

@Module({
    imports: [],
    providers: [
        OrderGateway,
        SupportTicketGateway,
        ShipmentChatGateway,
        DriverShipmentGateway
    ],
    exports: [
        OrderGateway,
        SupportTicketGateway,
        ShipmentChatGateway,
        DriverShipmentGateway
    ],
})
export class GatewaysModule { }
