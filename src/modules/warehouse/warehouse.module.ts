import { Module } from '@nestjs/common';
import { WarehouseController } from './warehouse.controller';
import { WarehouseService } from './warehouse.service';
import { WarehouseOperationTransaction } from './util/warehouse-opreation.transaction';

@Module({
  controllers: [WarehouseController],
  providers: [WarehouseService,WarehouseOperationTransaction]
})
export class WarehouseModule {}
