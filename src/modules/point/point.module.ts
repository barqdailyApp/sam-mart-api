import { Module } from '@nestjs/common';
import { PointController } from './point.controller';
import { PointService } from './point.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { AddSubscriptionTransaction } from '../subscription/util/add-subscription.transaction';
import { OrderModule } from '../order/order.module';

@Module({
  imports:[OrderModule],
  controllers: [PointController],
  providers: [PointService,SubscriptionService,AddSubscriptionTransaction,]
})
export class PointModule {}
