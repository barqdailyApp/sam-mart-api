import { UseGuards } from "@nestjs/common";
import { Server, Socket } from 'socket.io';
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Gateways } from "src/core/base/gateways";
import { Shipment } from "src/infrastructure/entities/order/shipment.entity";
import { User } from "src/infrastructure/entities/user/user.entity";
import { WsJwtAuthGuard } from "src/modules/authentication/guards/ws-auth.guard";
import { Repository } from "typeorm";
import { SocketAuthMiddleware } from "./middlewares/ws-auth";
import { ShipmentPrivacyMiddleware } from "./middlewares/ws-shipment-chat-privacy";
import { ShipmentChat } from "src/infrastructure/entities/order/shipment-chat.entity";
import { toUrl } from "src/core/helpers/file.helper";
import { UserResponse } from "src/modules/user/dto/responses/user.response";
import { RestaurantOrder } from "src/infrastructure/entities/restaurant/order/restaurant_order.entity";
import { ShipmentMessageResponse } from "src/modules/order/dto/response/shipment-message.response";

@WebSocketGateway({ namespace: Gateways.ShipmentChat.Namespace, cors: { origin: '*' } })
@UseGuards(WsJwtAuthGuard)
export class ShipmentChatGateway {
    constructor(
        private configService: ConfigService,
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(Shipment) private shipmentRepository: Repository<Shipment>
        ,@InjectRepository(RestaurantOrder) private restaurantOrderService: Repository<RestaurantOrder>
    ) { }

    @WebSocketServer()
    server: Server;

    afterInit(client: Socket) {
        client.use(SocketAuthMiddleware(this.configService, this.userRepository) as any);
        // client.use(ShipmentPrivacyMiddleware(this.shipmentRepository,this.restaurantOrderService) as any);
    }

    handleSendMessage(payload: {
        shipment: Shipment,
        shipmentChat: ShipmentChat,
        user: UserResponse,
        action: string
    }) {
        const shipmentOwnerId = payload.shipment.order.user_id;
        const shipmentDriverId = payload.shipment.driver.user_id;
        const connectedSockets: any = this.server.sockets

        if (payload.shipmentChat && payload.shipmentChat.attachment) {
            payload.shipmentChat.attachment.file_url = toUrl(payload.shipmentChat.attachment.file_url);
        }

        connectedSockets.forEach(socket => {
            if (socket.user && (
                socket.user.id === shipmentOwnerId ||
                socket.user.id === shipmentDriverId ||
                socket.user.roles.includes('ADMIN')
            )) {
                socket.emit(`shipment_chat_${payload.shipment.id}`, payload);
            }
        });
    }


    handleRestaurantSendMessage(payload: {
        order: RestaurantOrder,
        message: ShipmentMessageResponse,
        user: UserResponse,
        action: string
    }) {
        const shipmentOwnerId = payload.order.user_id;
        const shipmentDriverId = payload.order.driver.user_id;
        const connectedSockets: any = this.server.sockets


        connectedSockets.forEach(socket => {
            if (socket.user && (
                socket.user.id === shipmentOwnerId ||
                socket.user.id === shipmentDriverId ||
                socket.user.roles.includes('ADMIN')
            )) {
                socket.emit(`food_order_chat_${payload.order.id}`, payload.message);
            }
        });
    }
}