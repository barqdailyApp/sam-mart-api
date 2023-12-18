import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ReviewOrder } from 'src/infrastructure/entities/review-order/review-order.entity';
import { Repository } from 'typeorm';
import { CreateReviewOrderRequest } from './dto/create-review-order.request';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { Order } from 'src/infrastructure/entities/order/order.entity';
import { OrderStatus } from 'src/infrastructure/data/enums/order-status.enum';
@Injectable()
export class ReviewOrderService {
  constructor(
    @InjectRepository(ReviewOrder)
    public reviewOrderRepository: Repository<ReviewOrder>,
    @InjectRepository(Order)
    public orderRepository: Repository<Order>,
    @Inject(REQUEST) private readonly _request: Request,
  ) {}

  async createReviewOrder(createReviewOrderRequest: CreateReviewOrderRequest) {
    const { comment, order_id, rate } = createReviewOrderRequest;
    const order = await this.orderRepository.findOne({
      where: {
        id: order_id,
        customer: {
          user_id: this._request.user.id,
        },
      },
      relations: {
        customer: {
          user: true,
        },
      },
    });
    if (!order) {
      throw new NotFoundException('message.order_not_found');
    }

    if (order.status !== OrderStatus.COMPLETED) {
      throw new NotFoundException('message.order_not_completed');
    }

    const reviewOrder = await this.reviewOrderRepository.findOne({
      where: {
        order_id,
      },
    });
    if (reviewOrder) {
      throw new NotFoundException('message.review_order_exists');
    }

    const createReviewOrder = this.reviewOrderRepository.create(
      createReviewOrderRequest,
    );
    return await this.reviewOrderRepository.save(createReviewOrder);
  }
}
