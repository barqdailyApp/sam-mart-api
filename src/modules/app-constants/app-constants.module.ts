import { Module } from '@nestjs/common';
import { AppConstantsController } from './app-constants.controller';
import { AppConstantsService } from './app-constants.service';

@Module({
  controllers: [AppConstantsController],
  providers: [AppConstantsService]
})
export class AppConstantsModule {}
