import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Gateways } from 'src/core/base/gateways';
import { User } from 'src/infrastructure/entities/user/user.entity';
import { In, Not, Repository } from 'typeorm';
import { SocketAuthMiddleware } from './middlewares/ws-auth';
import { Shipment } from 'src/infrastructure/entities/order/shipment.entity';
import { ShipmentStatusEnum } from 'src/infrastructure/data/enums/shipment_status.enum';
import { plainToClass } from 'class-transformer';
import { ShipmentDriverResponse } from 'src/modules/order/dto/response/driver-response/shipment-driver.respnse';
import { I18nResponse } from 'src/core/helpers/i18n.helper';
import { Inject } from '@nestjs/common';
@WebSocketGateway({
  namespace: Gateways.DriverShipment.Namespace,
  cors: { origin: '*' },
})
export class DriverShipmentGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  constructor(
    private configService: ConfigService,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  @WebSocketServer()
  server: Server;

  handleConnection(client: any) {
    console.log('Driver Shipment connected', client.id);
    // set the driver as online
  }

  handleDisconnect(client: any) {
    console.log(`Driver Shipment disconnected ${client.id}`);
    // set the driver as offline
  }
  async broadcastLocationDriver(driver_shipments: Shipment[]) {
    const connectedSockets: any = this.server.sockets;
    connectedSockets.forEach((socket: any) => {
      for (const shipment of driver_shipments) {
        socket.emit(`${Gateways.DriverShipment.ShipmentId}${shipment.id}`, {
          action: 'DRIVER_LOCATION_UPDATE',
          data: {
            order_id: shipment.order.id,
            shipment_id: shipment.id,
            driver: {
              latitude: shipment.driver.latitude,
              longitude: shipment.driver.longitude,
            },
          },
        });
      }
    });
  }
  afterInit(client: Socket) {
    client.use(
      SocketAuthMiddleware(this.configService, this.userRepository) as any,
    );
  }
}
