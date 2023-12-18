import { Module } from '@nestjs/common';
import { ServiceController } from './service.controller';
import { ServiceService } from './service.service';
import { UpdateServiceTransaction } from './utils/update-service.transaction';
import { PackageModule } from '../package/package.module';
import { DeleteServiceTransaction } from './utils/delete-service.transaction';

@Module({
  controllers: [ServiceController],
  providers: [ServiceService, UpdateServiceTransaction,DeleteServiceTransaction],
  exports: [ServiceService],
  imports: [PackageModule ],
})
export class ServiceModule {}
