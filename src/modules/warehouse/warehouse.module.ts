import { Module } from '@nestjs/common';
import { WarehouseController } from './warehouse.controller';
import { WarehouseService } from './warehouse.service';
import { WarehouseOperationTransaction } from './util/warehouse-opreation.transaction';
import { RegionService } from '../region/region.service';

@Module({
  controllers: [WarehouseController],
  providers: [WarehouseService, WarehouseOperationTransaction, RegionService]
})
export class WarehouseModule { }
