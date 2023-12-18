import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { OrderBookingTransaction } from './util/order-booking.transaction';
import { GatewaysModule } from 'src/integration/gateways/gateways.module';
import { NotificationModule } from '../notification/notification.module';
import { OrderRescheduleTransaction } from './util/order-reschedule.tranaction';
import { CronOrderService } from './cron-order.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [GatewaysModule,NotificationModule,  ScheduleModule.forRoot()],
exports:[OrderModule,OrderService],
  controllers: [OrderController],
  providers: [OrderService,OrderBookingTransaction,OrderRescheduleTransaction,CronOrderService]
})
export class OrderModule {}
