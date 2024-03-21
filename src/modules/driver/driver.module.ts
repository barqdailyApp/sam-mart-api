import { Module } from '@nestjs/common';
import { DriverController } from './driver.controller';
import { DriverService } from './driver.service';
import { GatewaysModule } from 'src/integration/gateways/gateways.module';
import { DeleteDriverAccountTransaction } from './transactions/delete-driver-account.transaction';

@Module({
  controllers: [DriverController],
  providers: [DriverService,DeleteDriverAccountTransaction],
  imports: [GatewaysModule],
  exports: [DeleteDriverAccountTransaction],
})
export class DriverModule {}
