import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WsResponse,
  MessageBody,
  ConnectedSocket,
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
import { OrderStatusChangePayload } from './interfaces/order/order-status-change.payload';
import { plainToInstance } from 'class-transformer';
import { OrderStatusChangeResponse } from './dto/response/order-status-change.response';
import { ReturnOrderPayload } from './interfaces/order/return-order.payload';
import { ReturnOrderResponse } from './dto/response/return-order.response';
import { i18nEntity } from 'src/core/helpers/i18n.helper';
import { RestaurantOrderListResponse } from 'src/modules/restaurant-order/dto/response/restaurant-order-list.response';

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
    } else if (
      client.user?.roles.includes(Role.ADMIN) ||
      client.user?.roles.includes(Role.EMPLOYEE)
    ) {
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
    } else if (
      client.user?.roles.includes(Role.ADMIN) ||
      client.user?.roles.includes(Role.EMPLOYEE)
    ) {
      client.leave("admin")
    } else if (client.user?.roles.includes(Role.CLIENT)) {
      client.leave(client.user.id)
    }
  }

  async notifyOrderStatusChange(payload: OrderStatusChangePayload) {
    const { action, body } = payload;
    console.log('payload', payload);
    const message = plainToInstance(OrderStatusChangeResponse,
      {
        action: action,
        client: body.client,
        driver: body.driver ? {
          ...body.driver,

          user: {
            username: body.driver.user.username,
            name: body.driver.user.name,
            avatar: body.driver.user.avatar,
            phone: body.driver.user.phone
          }

        } : null,
        warehouse: { ...i18nEntity(body.warehouse, 'en') },
        order: {
          ...body.order,
          status: body.shipment.status,
          order_confirmed_at: body.shipment.order_confirmed_at,
          order_on_processed_at: body.shipment.order_on_processed_at,
          order_shipped_at: body.shipment.order_shipped_at,
          order_delivered_at: body.shipment.order_delivered_at,
          cancel_reason_id: body.shipment.cancel_reason_id,
          canceled_by: body.shipment?.canceled_by,
          order_canceled_at: body.shipment.order_canceled_at,
          shipment_id: body.shipment.id
        },
      },
      {
        excludeExtraneousValues: true,
      }
    );

    await this.server.to(payload.to_rooms).emit("order_status_change", message);
  }
  async emitOrderConfirmedEvent(order: any,driver_ids?:string[]) {
    const respone = plainToInstance(RestaurantOrderListResponse,order,{
      excludeExtraneousValues: true,
    })
    this.server.to(driver_ids).emit("new_restaurant_order", respone);
  }

  async notifyReturnOrder(payload: ReturnOrderPayload) {
    const { body, to_rooms } = payload;
    const message = plainToInstance(ReturnOrderResponse,
      {
        ...body,
        warehouse: { ...i18nEntity(body.warehouse, 'en') },
        driver: {
          ...body.driver,
          user: body.driver?.user,
        },
      },
      {
        excludeExtraneousValues: true,
      }
    );

    await this.server.to(payload.to_rooms).emit("order_return", message)
  }
}
