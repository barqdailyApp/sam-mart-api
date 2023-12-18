import { Module } from '@nestjs/common';
import { OrderGateway } from './order.gateway';

@Module({
    imports: [],
    providers: [OrderGateway
    ],
    exports: [OrderGateway
    ],
})
export class GatewaysModule { }
