import { Controller, Post, Body, Headers } from '@nestjs/common';
import { MoyasarPayment } from './models/payment-model';
import { SubscriptionService } from '../subscription/subscription.service';
import { GiftService } from '../gift/gift.service';
import { OrderService } from '../order/order.service';
// Custom type for Moyasar webhook payload

@Controller('webhook')
export class WebhookController {
  constructor(
    private readonly orderService: OrderService,
    private readonly subscriptionService: SubscriptionService,
    private readonly gftService: GiftService,
  ) {}

  @Post()
  async handleWebhook(
    @Body() payload: any,
    @Headers('moyasar-signature') signature: string,
  ) {
    // Verify the webhook signature
    // const isValidSignature = verifyWebhookSignature(payload, signature);
    const payment = new MoyasarPayment({ ...payload['data'] });
    if (payment.status == 'paid') {
      if (payment.metadata.receiver_phone_number) {
        await this.gftService.sendGift(payment.metadata);
      } else {
const subscriotion=        await this.subscriptionService.addSubscription(payment.metadata);

        if(payment.metadata.order){
         
        payment.metadata.order.subscription_id=subscriotion.id
        payment.metadata.order.customer_id=subscriotion.customer_id
        console.log(payment.metadata.order)
await this.orderService.orderBooking(payment.metadata.order)}
      }
    }
    return payload;
  }
}
