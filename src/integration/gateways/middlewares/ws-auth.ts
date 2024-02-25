import { ConfigService } from '@nestjs/config';
import { Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';
import { Repository } from 'typeorm';
import { User } from 'src/infrastructure/entities/user/user.entity';

type SocketIOMiddleWare = {
    (client: Socket, next: (err?: Error) => void);
};

declare module 'socket.io' {
    interface Socket {
        user: User; // Add your user property
    }
}

export const SocketAuthMiddleware = (
    configService: ConfigService,
    userRepository?: Repository<User>,
): SocketIOMiddleWare => {
    return async (client, next) => {
        try {
            const authToken = client.handshake.headers.authorization?.split(' ')[1];
            const jwtPayload: any = <any>(
                jwt.verify(authToken, configService.get('app.key'))
            );

            if (userRepository) {
                const user: User = await userRepository.findOne({ where: { id: jwtPayload.sub } });
                if (user) {
                    client.user = user;
                } else {
                    throw new Error('User not found');
                }
            }
            next();
        } catch (error) {
            console.error("Authentication error:", error.message);
            // Refuse the connection
            next(new Error("Authentication failed. Please log in."));
        }
    };
};