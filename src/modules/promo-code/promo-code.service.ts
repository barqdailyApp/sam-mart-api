import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/core/base/service/service.base';
import { PromoCode } from 'src/infrastructure/entities/promo-code/promo-code.entity';
import { MoreThan, Repository } from 'typeorm';
import { Request } from 'express';
import { PaymentMethod } from 'src/infrastructure/entities/payment_method/payment_method.entity';

@Injectable()
export class PromoCodeService extends BaseService<PromoCode> {
  constructor(
    @InjectRepository(PromoCode)
    public readonly promoCodeRepository: Repository<PromoCode>,
    @InjectRepository(PaymentMethod)
    public readonly paymentMethodRepository: Repository<PaymentMethod>,
    @Inject(REQUEST) private readonly request: Request,
  ) {
    super(promoCodeRepository);
  }

  async addPaymentMethodToPromoCode(
    promo_code_id: string,
    payment_method_id: string,
  ) {
    const promo_code = await this.promoCodeRepository.findOne({
      where: { id: promo_code_id },
      relations: ['payment_methods'],
    });

    if (!promo_code) {
      throw new BadRequestException('message.promo_code_not_found');
    }

    const payment_method = await this.paymentMethodRepository.findOne({
      where: { id: payment_method_id },
    });

    if (!payment_method) {
      throw new BadRequestException('message.payment_method_not_found');
    }
    const is_exists = promo_code.payment_methods.filter(
      (payment_method) => payment_method.id == payment_method_id,
    );
    if (is_exists.length > 0) {
      throw new BadRequestException(
        'message.promo_code_already_has_this_payment_method',
      );
    }
    promo_code.payment_methods = [
      ...promo_code.payment_methods,
      payment_method,
    ];
    return await this.promoCodeRepository.save(promo_code);
  }

  async removePaymentMethodFromPromoCode(
    promo_code_id: string,
    payment_method_id: string,
  ) {
    const promo_code = await this.promoCodeRepository.findOne({
      where: { id: promo_code_id },
      relations: ['payment_methods'],
    });

    if (!promo_code) {
      throw new BadRequestException('message.promo_code_not_found');
    }

    const payment_method = await this.paymentMethodRepository.findOne({
      where: { id: payment_method_id },
    });

    if (!payment_method) {
      throw new BadRequestException('message.payment_method_not_found');
    }

    promo_code.payment_methods = promo_code.payment_methods.filter(
      (payment_method) => payment_method.id !== payment_method_id,
    );
    return await this.promoCodeRepository.save(promo_code);
  }

  async getValidPromoCodeByCode(code: string, payment_method_id?: string) {
    const valid_code = await this.promoCodeRepository.findOne({
      where: { code, expire_at: MoreThan(new Date()), is_active: true },
      relations: ['payment_methods'],
    });

    if (!valid_code || valid_code.current_uses >= valid_code.number_of_uses) {
      throw new BadRequestException('message.invalid_promo_code');
    }
    if(valid_code.payment_methods.length>0){
      const is_exists = valid_code.payment_methods.filter(
        (payment_method) => payment_method.id == payment_method_id,
      );
      if(is_exists.length==0){
        throw new BadRequestException('message.invalid_promo_code');
      }
    }

    if (valid_code.use_once) {
      if (valid_code.user_ids == null) valid_code.user_ids = [];
      const used = valid_code.user_ids.filter(
        (id) => id == this.request.user.id,
      );
      if (used.length > 0) {
        throw new BadRequestException('message.promo_code_used');
      }
    }

    return valid_code;
  }
}
