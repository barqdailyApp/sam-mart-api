import { UseGuards } from '@nestjs/common';
import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Gateways } from 'src/core/base/gateways';
import { WsJwtAuthGuard } from 'src/modules/authentication/guards/ws-auth.guard';
import { SocketAuthMiddleware } from './middlewares/ws-auth';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/infrastructure/entities/user/user.entity';
import { Repository } from 'typeorm';
import { Driver } from 'src/infrastructure/entities/driver/driver.entity';
import { ValidDriverMiddleware } from './middlewares/ws-valid-driver';
import { SendOfferToDriver } from './interfaces/fast-delivery/send-offer-payload.response';

@WebSocketGateway({ namespace: Gateways.FastDelivery.Namespace, cors: { origin: '*' } })
@UseGuards(WsJwtAuthGuard)
export class FastDeliveryGateway
    implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    constructor(
        private configService: ConfigService,
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(Driver) private driverRepository: Repository<Driver>,
    ) { }

    afterInit(client: Socket) {
        client.use(SocketAuthMiddleware(this.configService, this.userRepository) as any);
        client.use(ValidDriverMiddleware(this.driverRepository) as any);
    }

    @WebSocketServer()
    server: Server;

    async broadcastOfferToDrivers(payload: SendOfferToDriver) {
        const connectedSockets: any = this.server.sockets;
        connectedSockets.forEach((socket: any) => {
            if (
                socket.driver &&
                socket.driver?.warehouse_id === payload.shipment.warehouse_id
            ) {
                socket.emit(`driver_fast_delivery`, payload);
            }
        });
    }

    handleConnection(client: any) {
        console.log('Order connected', client.id);
        // set the driver as online
    }

    handleDisconnect(client: any) {
        console.log(`Order disconnected ${client.id}`);
        // set the driver as offline
    }

}
