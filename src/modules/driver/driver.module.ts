import { Module } from '@nestjs/common';
import { DriverController } from './driver.controller';
import { DriverService } from './driver.service';
import { GatewaysModule } from 'src/integration/gateways/gateways.module';

@Module({
  controllers: [DriverController],
  providers: [DriverService],
  imports: [GatewaysModule],
})
export class DriverModule {}
