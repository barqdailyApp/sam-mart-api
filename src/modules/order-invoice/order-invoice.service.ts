import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderInvoice } from 'src/infrastructure/entities/order/order-invoice.entity';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { Customer } from 'src/infrastructure/entities/customer/customer.entity';

@Injectable()
export class OrderInvoiceService {
  constructor(
    @Inject(REQUEST) private readonly _request: Request,

    @InjectRepository(OrderInvoice)
    private readonly orderInvoiceRepository: Repository<OrderInvoice>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async getSingleOrderInvoice(id: string): Promise<OrderInvoice> {
    const get_order_invoice = await this.orderInvoiceRepository.findOne({
      where: { id },
      relations: {
        promo_code: true,
        subscription: {
          service: true,
        },
      },
    });
    if (!get_order_invoice) {
  throw new NotFoundException("message.order_invoice_not_found");
    }
    return get_order_invoice;
  }

  async getAllOrderInvoices(): Promise<OrderInvoice[]> {
    const customer = await this.customerRepository.findOneBy({
      user_id: this._request.user.id,
    });
    const all_order_invoices = await this.orderInvoiceRepository.find({
      where: { customer_id: customer.id },
      relations: {
        promo_code: true,
        subscription: {
          service: true,
        },
      },
    });
    return all_order_invoices;
  }

}
