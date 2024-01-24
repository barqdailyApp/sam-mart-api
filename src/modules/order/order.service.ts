import { Inject, Injectable } from '@nestjs/common';
import { BaseUserService } from 'src/core/base/service/user-service.base';
import { Order } from 'src/infrastructure/entities/order/order.entity';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MakeOrderRequest } from './dto/make-order-request';
import { MakeOrderTransaction } from './util/make-order.transaction';
import { OrderClientQuery } from './filter/order-client.query';
@Injectable()
export class OrderService extends BaseUserService<Order> {
  constructor(
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    @Inject(REQUEST) request: Request,
    private readonly makeOrdrTransacton: MakeOrderTransaction,
  ) {
    super(orderRepository, request);
  }

  async makeOrder(req: MakeOrderRequest) {
    return await this.makeOrdrTransacton.run(req);
  }

  async getAllOrders(orderClientQuery: OrderClientQuery) {
    const { limit, page } = orderClientQuery;
    const skip = (page - 1) * limit;

    let query = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.section', 'section_order')
      .leftJoinAndSelect('order.warehouse', 'warehouse_order')
      .leftJoinAndSelect('order.address', 'address')
      .leftJoinAndSelect('order.shipments', 'shipments')
      .leftJoinAndSelect('shipments.driver', 'driver')
      .leftJoinAndSelect('shipments.warehouse', 'warehouse_shipment')
      .leftJoinAndSelect('shipments.shipment_products', 'shipment_products')

     .leftJoinAndSelect('shipment_products.product_category_price','product_category_price')

      .skip(skip)
      .take(limit);

    const [orders, total] = await query.getManyAndCount();
    return { orders, total };
  }
}
