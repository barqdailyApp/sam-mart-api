import { UnauthorizedException } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { Shipment } from "src/infrastructure/entities/order/shipment.entity";
import { Repository } from "typeorm";

type SocketIOMiddleWare = {
    (client: Socket, next: (err?: Error) => void);
};

export const ShipmentPrivacyMiddleware = (
    shipmentRepository: Repository<Shipment>
): SocketIOMiddleWare => {
    return async (client, next) => {
        try {
            const shipment_id: string = Array.isArray(client.handshake.query.shipment_id)
                ? client.handshake.query.shipment_id.join(',')
                : client.handshake.query.shipment_id;

            const shipment = await shipmentRepository.findOne({
                where: { id: shipment_id },
                relations: ['order', 'driver']
            });

            if (!shipment) {
                throw new Error('Shipment not found');
            }

            const user = client.user;
            if (!user) {
                throw new Error('User not found');
            }

            if (
                shipment.driver.user_id !== user.id &&
                shipment.order.user_id !== user.id &&
                !user.roles.includes(Role.ADMIN) && 
                !user.roles.includes(Role.EMPLOYEE)
            ) {
                throw new UnauthorizedException('You are not allowed to add chat message to this shipment');
            }

            next();
        } catch (error) {
            next(error);
        }
    };
}