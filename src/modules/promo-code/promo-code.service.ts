import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/core/base/service/service.base';
import { PromoCode } from 'src/infrastructure/entities/promo-code/promo-code.entity';
import { MoreThan, Repository } from 'typeorm';

@Injectable()
export class PromoCodeService extends BaseService<PromoCode> {
  constructor(
    @InjectRepository(PromoCode)
    private readonly promoCodeRepository: Repository<PromoCode>,
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
return valid_code;
}}
