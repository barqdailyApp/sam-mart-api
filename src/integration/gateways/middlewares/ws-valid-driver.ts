import { UnauthorizedException } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { Driver } from 'src/infrastructure/entities/driver/driver.entity';
import { Shipment } from "src/infrastructure/entities/order/shipment.entity";
import { Repository } from "typeorm";

type SocketIOMiddleWare = {
    (client: Socket, next: (err?: Error) => void);
};

declare module 'socket.io' {
    interface Socket {
        driver: Driver; // Add your user property
    }
}

export const ValidDriverMiddleware = (
    driverRepository: Repository<Driver>
): SocketIOMiddleWare => {
    return async (client, next) => {
        try {
            const is_driver = client.user.roles.includes(Role.DRIVER)
            if (is_driver) {
                const driver = await driverRepository.findOne({
                    where: { user_id: client.user.id },
                });

                if (!driver) {
                    throw new Error('Driver not found');
                }
                
                client.driver = driver;
            }

            next();
        } catch (error) {
            next(error);
        }
    };
}