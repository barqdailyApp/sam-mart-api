import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Subscription } from 'src/infrastructure/entities/subscription/subscription.entity';
import { PromoCode } from 'src/infrastructure/entities/promo-code/promo-code.entity';
import { Repository } from 'typeorm';
import { CreateNewPromoCodeRequest } from './dto/create-new-promo-code.request';
import { Customer } from 'src/infrastructure/entities/customer/customer.entity';
import { UpdatePromoCodeRequest } from './dto/update-promo-code.request';
@Injectable()
export class PromoCodeService {
  constructor(
    @Inject(REQUEST) private readonly _request: Request,

    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    @InjectRepository(PromoCode)
    private readonly promoCodeRepository: Repository<PromoCode>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async allPromoCodes() {
    const promo_Codes = await this.promoCodeRepository.find();
    return promo_Codes;
  }
  async createPromoCode(createNewPromoCodeRequest: CreateNewPromoCodeRequest) {
    const create_promo_code = this.promoCodeRepository.create(
      createNewPromoCodeRequest,
    );
    create_promo_code.code = (Math.floor(Math.random() * 9000) + 1000).toString();

    if (create_promo_code.end_time < create_promo_code.start_time) {
      throw new NotFoundException("message.end_time_must_be_greater");
    }
    const save_promo_code = await this.promoCodeRepository.save(
      create_promo_code,
    );
    return save_promo_code;
  }
  async updatePromoCode(
    code_id: string,
    updatePromoCodeRequest: UpdatePromoCodeRequest,
  ) {
    console.log('updatePromoCodeRequest', updatePromoCodeRequest);
    await this.singlePromoCode(code_id);
    await this.promoCodeRepository.update(
      { code: code_id },
      updatePromoCodeRequest,
    );
    return this.singlePromoCode(code_id);
  }

  async deletePromoCode(code_id: string) {
    await this.singlePromoCode(code_id);
    return await this.promoCodeRepository.delete({ code: code_id });
  }

  async singlePromoCode(code_id: string) {
    const customer = await this.customerRepository.findOne({
      where: { user_id: this._request.user.id },
    });
    const promo_code_current = await this.promoCodeRepository.findOne({
      where: {
        code: code_id,
      },
      relations: { users: true },
    });


    // Throw an exception if the promo code is not found
    if (!promo_code_current) {
      throw new NotFoundException(
        "message.promo_code_not_found",
      );
    }
    
    // Throw an exception if the promo code has reached its maximum uses

    // if (promo_code_current.current_uses === promo_code_current.max_uses) {
    //   throw new NotFoundException("message.promo_Code_reached_limit");
    // }
    const subscription_promo_codes = await this.subscriptionRepository.find({
      where: {
        customer_id: customer.id,
        promo_code_id: promo_code_current.id,
      },
    });
    // Throw an exception if the promo code has been used by the maximum number of users

    if (
      subscription_promo_codes.length === promo_code_current.max_use_by_users
    ) {
      throw new NotFoundException("message.promo_code_cant_be_used");
    }
    const today = new Date();

    // Throw an exception if the promo code has expired
    if (today > promo_code_current.end_time) {
      throw new NotFoundException("message.promo_code_expired");
    }
    // Throw an exception if the promo code has not started
    if(today< promo_code_current.start_time){
      throw new NotFoundException("message.promo_code_not_started");
      
    }
    return promo_code_current;
  }
}
