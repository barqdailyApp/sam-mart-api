import { Module } from '@nestjs/common';
import { DriverController } from './driver.controller';
import { DriverService } from './driver.service';
import { GatewaysModule } from 'src/integration/gateways/gateways.module';
import { DeleteDriverAccountTransaction } from './transactions/delete-driver-account.transaction';
import { UpdateProfileDriverTransaction } from './transactions/update-profile-driver.transaction';

@Module({
  controllers: [DriverController],
  providers: [DriverService,DeleteDriverAccountTransaction,UpdateProfileDriverTransaction],
  imports: [GatewaysModule],
  exports: [DeleteDriverAccountTransaction,UpdateProfileDriverTransaction],
})
export class DriverModule {}
