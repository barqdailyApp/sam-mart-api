import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/core/base/service/service.base';
import { Gift } from 'src/infrastructure/entities/gift/gift.entity';
import { Repository } from 'typeorm';
import { SendGiftTransaction } from './util/send-gift.transaction';
import { SendGiftRequest } from './dto/request/send-gift.request';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { AuthenticationService } from '../authentication/authentication.service';
import { User } from 'src/infrastructure/entities/user/user.entity';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { Customer } from 'src/infrastructure/entities/customer/customer.entity';
import { GiftFilterRequest } from './dto/request/order-filter.request';
import { SubscriptionRequest } from '../subscription/dto/subscription-request';
@Injectable()
export class GiftService extends BaseService<Gift> {
  constructor(
    @InjectRepository(Gift)
    public giftRepository: Repository<Gift>,
    @Inject(SendGiftTransaction)
    private readonly sendGiftTransaction: SendGiftTransaction,
    @Inject(REQUEST) private readonly request: Request,
    @Inject(AuthenticationService)
    readonly authenticationService: AuthenticationService,
    @InjectRepository(User)
    public userRepository: Repository<User>,
    @InjectRepository(Customer)
    public customerRepository: Repository<Customer>,
  ) {
    super(giftRepository);
  }

  async sendGift(request: SendGiftRequest) {
    const { receiver_phone_number } = request;
    request.is_new_user = false;
    const user_receiver = await this.userRepository.findOne({
      where: { phone: receiver_phone_number },
      relations: ['customer'],
    });

    if (!user_receiver) {
      request.is_new_user = true;
      await this.authenticationService.register({
        avatarFile: null,
        name: receiver_phone_number,
        phone: receiver_phone_number,
        role: Role.CLIENT,
        email: null,
      });
      // console.log('user', user);
    }
    const gift = await this.sendGiftTransaction.run(request);
    const gift_details = await this.giftRepository.findOne({
      where: {
        id: gift.id,
      },
      relations: {
        sender: { user: true },
        receiver: { user: true },
        subscription: {
          service: true,
          order_invoice: true,
        },
      },
    });
    return gift_details;
  }

  async allGiftsSender(giftFilterRequest: GiftFilterRequest) {
    const { page, limit } = giftFilterRequest;
    const skip = (page - 1) * limit;
    const customer_current = await this.customerRepository.findOne({
      where: {
        user_id: this.request.user.id,
      },
    });
    return await this.giftRepository.find({
      skip,
      take: limit,
      withDeleted: true,
      where: { sender_id: customer_current.id },
      relations: {
        sender: { user: true },
        receiver: { user: true },
        subscription: {
          service: true,
          order_invoice: true,
        },
      },
    });
  }
}
