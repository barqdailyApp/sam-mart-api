import { Module } from '@nestjs/common';
import { AdditionalServiceController } from './additional-service.controller';
import { AdditionalServiceService } from './additional-service.service';

@Module({
  controllers: [AdditionalServiceController],
  providers: [AdditionalServiceService]
})
export class AdditionalServiceModule {}
