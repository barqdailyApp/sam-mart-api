import { Module } from '@nestjs/common';
import { PromoCodeService } from './promo-code.service';
import { PromoCodeController } from './promo-code.controller';

@Module({
  providers: [PromoCodeService],
  controllers: [PromoCodeController]
})
export class PromoCodeModule {}
