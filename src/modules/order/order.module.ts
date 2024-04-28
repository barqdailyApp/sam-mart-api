import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { MakeOrderTransaction } from './util/make-order.transaction';
import { ShipmentController } from './shipment.controller';
import { ShipmentService } from './shipment.service';
import { GatewaysModule } from 'src/integration/gateways/gateways.module';
import { ReturnOrderService } from './return-order.service';
import { NotificationModule } from '../notification/notification.module';
import { ReasonService } from '../reason/reason.service';
import { TransactionService } from '../transaction/transaction.service';
import { WarehouseOperationTransaction } from '../warehouse/util/warehouse-opreation.transaction';
import { PaymentMethodService } from '../payment_method/payment_method.service';
import { PromoCodeService } from '../promo-code/promo-code.service';

@Module({
  controllers: [OrderController, ShipmentController],
  providers: [
    OrderService,
    MakeOrderTransaction,
    ShipmentService,
    ReturnOrderService,
    ReasonService,
    TransactionService,
    WarehouseOperationTransaction,
    PaymentMethodService,
    PromoCodeService,
    TransactionService
    
  ],
  imports: [GatewaysModule, NotificationModule],
})
export class OrderModule {}
