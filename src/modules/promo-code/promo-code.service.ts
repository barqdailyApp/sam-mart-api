import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/core/base/service/service.base';
import { PromoCode } from 'src/infrastructure/entities/promo-code/promo-code.entity';
import { MoreThan, Repository } from 'typeorm';
import { Request } from 'express';

@Injectable()
export class PromoCodeService extends BaseService<PromoCode> {
  constructor(
    @InjectRepository(PromoCode)
    private readonly promoCodeRepository: Repository<PromoCode>,
    @Inject(REQUEST) private readonly request: Request,
  ) {
    super(promoCodeRepository);
  }

 async getValidPromoCodeByCode(code: string) {
    const valid_code = await this.promoCodeRepository.findOne({
      where: { code, expire_at: MoreThan(new Date()), is_active: true },
    });
    if(!valid_code || valid_code.current_uses >= valid_code.number_of_uses){
        throw new  BadRequestException('message.invalid_promo_code');
}
if(valid_code.use_once){
  if(valid_code.user_ids==null)
  valid_code.user_ids=[]
  const used=valid_code.user_ids.filter((id)=>id==this.request.user.id)
  if(used.length>0){
    throw new  BadRequestException('message.promo_code_used');
  }
          }


return valid_code;
}}
