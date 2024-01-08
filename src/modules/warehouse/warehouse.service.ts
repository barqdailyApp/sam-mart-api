import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/core/base/service/service.base';
import { BaseUserService } from 'src/core/base/service/user-service.base';
import { Warehouse } from 'src/infrastructure/entities/warehouse/warehouse.entity';
import { Repository } from 'typeorm';
import { WarehouseOperationTransaction } from './util/warehouse-opreation.transaction';
import { WarehouseOperationRequest } from './dto/requests/warehouse-operation.request';

@Injectable()
export class WarehouseService extends BaseService<Warehouse> {

constructor(@InjectRepository(Warehouse) private readonly warehouse_repo: Repository<Warehouse>,
private readonly warehouseOperationTransaction: WarehouseOperationTransaction) {
    super(warehouse_repo);
}

async CreateWAarehouseOperation(request:WarehouseOperationRequest){
    return  await this.warehouseOperationTransaction.run(request);
}

}
