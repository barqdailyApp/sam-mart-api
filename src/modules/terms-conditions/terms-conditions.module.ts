import { Module } from '@nestjs/common';
import { TermsConditionsService } from './terms-conditions.service';
import { TermsConditionsController } from './terms-conditions.controller';

@Module({
  providers: [TermsConditionsService],
  controllers: [TermsConditionsController]
})
export class TermsConditionsModule {}
