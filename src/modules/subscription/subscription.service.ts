import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AddSubscriptionTransaction } from './util/add-subscription.transaction';
import { BaseUserService } from 'src/core/base/service/user-service.base';
import { Subscription } from 'src/infrastructure/entities/subscription/subscription.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, MoreThan, Repository } from 'typeorm';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { BaseService } from 'src/core/base/service/service.base';
import { Customer } from 'src/infrastructure/entities/customer/customer.entity';
import { PaginatedRequest } from 'src/core/base/requests/paginated.request';
import {
  applyQueryFilters,
  applyQueryIncludes,
  applyQuerySort,
} from 'src/core/helpers/service-related.helper';
import { SubscriptionRequest } from './dto/subscription-request';
import { SubscriptionsFilterRequest } from './dto/subscriptions-filter.request';
import { SubscriptionStatus } from 'src/infrastructure/data/enums/subscription.enum';
import { OrderStatus } from 'src/infrastructure/data/enums/order-status.enum';
@Injectable()
export class SubscriptionService extends BaseService<Subscription> {
  constructor(
    @Inject(AddSubscriptionTransaction)
    private readonly addSubscriptionTransaction: AddSubscriptionTransaction,
    @Inject(REQUEST) public request: Request,
    @InjectRepository(Subscription) readonly _repo: Repository<Subscription>,
    @InjectRepository(Customer)
    private readonly customer_repo: Repository<Customer>,
  ) {
    super(_repo);
  }
  async addSubscription(request: SubscriptionRequest) {
    return await this.addSubscriptionTransaction.run(request);
  }

  async findOne(id: string): Promise<Subscription> {
    return await this._repo.findOne({ where: { id }, relations: ['service'] });
  }

  async singleSubscription(id: string) {
    const subscription_current = this._repo.findOne({
      where: { id },
      withDeleted:true,
      relations: {
        service: true,
        promo_code: true,
        orders: {
          services: true,
          subscription: true,
          slot: true,
          vehicle: {
            color: true,
            images: true,
            brand_model: true,
            brand: true,
          },
          
          address: true,
        },
      },
      order: {
        created_at: 'DESC',
      }
    });
    if (!subscription_current)
      throw new NotFoundException("message.subscription_not_found");
    return subscription_current;
  }

  async findAll(options?: PaginatedRequest): Promise<Subscription[]> {
    const customer = await this.customer_repo.findOneBy({
      user_id: this.request.user.id,
    });
    applyQuerySort(options, 'wash_count=DESC');
    applyQuerySort(options, 'created_at=DESC');
    applyQueryIncludes(options, 'orders');
    applyQueryIncludes(options, 'service');

    applyQueryFilters(options, `customer_id=${customer.id}`);
    return await super.findAll(options);
  }

  async allSubscription(
    subscriptionsFilterRequest: SubscriptionsFilterRequest,
  ) {
    const { page, limit, all_orders, with_order, with_expired } =
      subscriptionsFilterRequest;
    const skip = (page - 1) * limit;
    const customer = await this.customer_repo.findOneBy({
      user_id: this.request.user.id,
    });
    let status_subscriptions = [];

    if (with_expired == true) {
      status_subscriptions = [
        SubscriptionStatus.ACTIVE,
        SubscriptionStatus.Gift,
        SubscriptionStatus.RESCHEDULED,
        // SubscriptionStatus.EXPIRED,
        SubscriptionStatus.EMPTY,
      ];
    } else if (with_expired == false) {
      status_subscriptions = [
        SubscriptionStatus.ACTIVE,
        SubscriptionStatus.Gift,
        SubscriptionStatus.RESCHEDULED,
        // SubscriptionStatus.EMPTY,
      ];
    } else {
      status_subscriptions = [];
    }
    return await this._repo.find({
      skip,
      take: limit,
      withDeleted:true,
      where: {
        customer_id: customer.id,
        orders: all_orders ? true : { status: OrderStatus.COMPLETED },
        status: In(status_subscriptions),
      },
      order: {
        created_at: 'DESC',
        wash_count: 'DESC',
      },
      relations: {
        service: true,
        orders: with_order
          ? {
              vehicle: {
                color: true,
                images: true,
                brand_model: true,
                brand: true,
              },
              address: true,
              slot: true,
            }
          : false,
      },
    });
  }

  async changeExpireDateSubscription(new_date: Date, id: string) {
    const subscription = await this.singleSubscription(id);
    if (subscription.expiry_date >= new_date) {
      throw new BadRequestException(
    "message.time_should_be_greater",
      )
    } 
    subscription.status = SubscriptionStatus.ACTIVE;
    return subscription;
  }
}
