import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/core/base/service/service.base';
import { BaseUserService } from 'src/core/base/service/user-service.base';
import { Warehouse } from 'src/infrastructure/entities/warehouse/warehouse.entity';
import { Repository } from 'typeorm';
import { WarehouseOperationTransaction } from './util/warehouse-opreation.transaction';
import { WarehouseOperationRequest } from './dto/requests/warehouse-operation.request';
import { UpdateWarehouseRequest } from './dto/requests/update-warehouse.request';
import { RegionService } from '../region/region.service';

@Injectable()
export class WarehouseService extends BaseService<Warehouse> {

    constructor(
        @InjectRepository(Warehouse) private readonly warehouse_repo: Repository<Warehouse>,
        private readonly warehouseOperationTransaction: WarehouseOperationTransaction,
        @Inject(RegionService) private readonly regionService: RegionService
        ) {
        super(warehouse_repo);
    }

    async CreateWAarehouseOperation(request: WarehouseOperationRequest) {
        return await this.warehouseOperationTransaction.run(request);
    }

    async updateWarehouse(id: string, warehouse: UpdateWarehouseRequest) {
        const warehouseEntity = await this.findOne(id);
        if (!warehouseEntity) throw new NotFoundException("Warehouse not found");

        if(warehouse.region_id) {
            const region = await this.regionService.single(warehouse.region_id);
            if(!region) throw new NotFoundException("Region not found");
        }

        const updatedWarehouse = Object.assign(warehouseEntity, warehouse);
        return await this.warehouse_repo.save(updatedWarehouse);
    }
}
