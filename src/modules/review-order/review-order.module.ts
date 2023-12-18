import { Module } from '@nestjs/common';
import { ReviewOrderController } from './review-order.controller';
import { ReviewOrderService } from './review-order.service';

@Module({
  controllers: [ReviewOrderController],
  providers: [ReviewOrderService]
})
export class ReviewOrderModule {}
