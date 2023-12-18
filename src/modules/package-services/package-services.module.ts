import { Module } from '@nestjs/common';
import { PackageServicesController } from './package-services.controller';
import { PackageServicesService } from './package-services.service';
import { ServiceModule } from '../service/service.module';
import { PackageModule } from '../package/package.module';
import { AddServiceToPackageTransaction } from './utils/add-service-to-package.transaction';
import { UpdateServiceToPackageTransaction } from './utils/update-service-to-package.transaction';

@Module({
  controllers: [PackageServicesController],
  providers: [PackageServicesService,AddServiceToPackageTransaction,UpdateServiceToPackageTransaction],
  imports: [PackageModule, ServiceModule],
  exports: [],
})
export class PackageServicesModule {}
