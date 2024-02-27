import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Gateways } from 'src/core/base/gateways';
import { SocketAuthMiddleware } from './middlewares/ws-auth';
import { ValidDriverMiddleware } from './middlewares/ws-valid-driver';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/infrastructure/entities/user/user.entity';
import { Driver } from 'src/infrastructure/entities/driver/driver.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Role } from 'src/infrastructure/data/enums/role.enum';
@WebSocketGateway({ namespace: Gateways.Order.Namespace, cors: { origin: '*' } })
export class OrderGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Driver) private driverRepository: Repository<Driver>,
  ) { }

  async afterInit(client: Socket) {
    await client.use(SocketAuthMiddleware(this.configService, this.userRepository) as any);
    await client.use(ValidDriverMiddleware(this.driverRepository) as any);
  }

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    // setup the client to join the rooms
    if (client.user?.roles.includes(Role.DRIVER)) {
      client.join(client.driver.warehouse_id)
      client.join(client.driver.id)
    } else if (client.user?.roles.includes(Role.ADMIN)) {
      client.join("admin")
    } else if (client.user?.roles.includes(Role.CLIENT)) {
      client.join(client.user.id)
    }
  }

  handleDisconnect(client: Socket) {
    // remove the client from the rooms
    if (client.user?.roles.includes(Role.DRIVER)) {
      client.leave(client.driver.warehouse_id)
      client.leave(client.driver.id)
    } else if (client.user?.roles.includes(Role.ADMIN)) {
      client.leave("admin")
    } else if (client.user?.roles.includes(Role.CLIENT)) {
      client.leave(client.user.id)
    }
  }


}
