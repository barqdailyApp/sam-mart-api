import { Module } from '@nestjs/common';
import { WebhookController } from './payment.controller';
import { PaymentService } from './payment.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { AddSubscriptionTransaction } from '../subscription/util/add-subscription.transaction';
import { GiftService } from '../gift/gift.service';
import { GiftModule } from '../gift/gift.module';
import { OrderModule } from '../order/order.module';

@Module({
  controllers: [WebhookController],
  imports:[GiftModule,OrderModule],
  providers: [SubscriptionService,AddSubscriptionTransaction,PaymentService]
})
export class PaymentModule {}
