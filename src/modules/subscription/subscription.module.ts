import { Module } from '@nestjs/common';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';
import { AddSubscriptionTransaction } from './util/add-subscription.transaction';

@Module({
  controllers: [SubscriptionController],
  providers: [SubscriptionService,AddSubscriptionTransaction]
})
export class SubscriptionModule {}
