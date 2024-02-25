import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Gateways } from 'src/core/base/gateways';
@WebSocketGateway({ namespace: Gateways.DriverShipment.Namespace, cors: { origin: '*' } })
export class DriverShipmentGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
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

  afterInit(server: any) {
    console.log(`Socket is live ${server.name}`);
  }
}
