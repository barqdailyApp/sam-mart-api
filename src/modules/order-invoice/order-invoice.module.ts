import { Module } from '@nestjs/common';
import { OrderInvoiceController } from './order-invoice.controller';
import { OrderInvoiceService } from './order-invoice.service';

@Module({
  controllers: [OrderInvoiceController],
  providers: [OrderInvoiceService]
})
export class OrderInvoiceModule {}
