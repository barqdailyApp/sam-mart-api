import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/core/base/service/service.base';
import { BaseUserService } from 'src/core/base/service/user-service.base';
import { Warehouse } from 'src/infrastructure/entities/warehouse/warehouse.entity';
import { Repository } from 'typeorm';
import { WarehouseOperationTransaction } from './util/warehouse-opreation.transaction';
import { WarehouseOperationRequest } from './dto/requests/warehouse-operation.request';
import { UpdateWarehouseRequest } from './dto/requests/update-warehouse.request';
import { RegionService } from '../region/region.service';
import { WarehouseTransferProductRequest } from './dto/requests/warehouse-transfer-product.request';
import { WarehouseProducts } from 'src/infrastructure/entities/warehouse/warehouse-products.entity';
import { operationType } from 'src/infrastructure/data/enums/operation-type.enum';
import { Driver } from 'src/infrastructure/entities/driver/driver.entity';

@Injectable()
export class WarehouseService extends BaseService<Warehouse> {

    constructor(
        @InjectRepository(Warehouse) private readonly warehouse_repo: Repository<Warehouse>,
        private readonly warehouseOperationTransaction: WarehouseOperationTransaction,
        @Inject(RegionService) private readonly regionService: RegionService,
        @InjectRepository(Driver) private readonly driver_repo: Repository<Driver>,
        @InjectRepository(WarehouseProducts) private readonly warehouseProducts_repo: Repository<WarehouseProducts>,
    ) {
        super(warehouse_repo);
    }

    async CreateWAarehouseOperation(request: WarehouseOperationRequest) {
        return await this.warehouseOperationTransaction.run(request);
    }

    async updateWarehouse(id: string, warehouse: UpdateWarehouseRequest) {
        const warehouseEntity = await this.findOne(id);
        if (!warehouseEntity) throw new NotFoundException("Warehouse not found");

        if (warehouse.region_id) {
            const region = await this.regionService.single(warehouse.region_id);
            if (!region) throw new NotFoundException("Region not found");
        }

        const updatedWarehouse = Object.assign(warehouseEntity, warehouse);
        return await this.warehouse_repo.save(updatedWarehouse);
    }

    async transferWarehouseProducts(from_warehouse_product_id: string, to_warehouse_id: string, transfered_product: WarehouseTransferProductRequest) {
        const { quantity } = transfered_product;

        const from_warehouse_product = await this.warehouseProducts_repo.findOne({
            where: {
                id: from_warehouse_product_id
            }
        });

        if (!from_warehouse_product) {
            throw new NotFoundException("Warehouse product not found");
        }

        const exported_warehouse = await this.warehouseOperationTransaction.run({
            warehouse_id: from_warehouse_product.warehouse_id,
            product_id: from_warehouse_product.product_id,
            quantity: quantity,
            type: operationType.EXPORT,
            product_measurement_id: from_warehouse_product.product_measurement_id
        });

        const imported_warehouse = await this.warehouseOperationTransaction.run({
            warehouse_id: to_warehouse_id,
            product_id: from_warehouse_product.product_id,
            quantity: quantity,
            type: operationType.IMPORT,
            product_measurement_id: from_warehouse_product.product_measurement_id
        });

        return { imported_warehouse, exported_warehouse };
    }

    async attachDriverToWarehouse(driver_id: string, warehouse_id: string) {
        const warehouse = await this.warehouse_repo.findOne({
            where: {
                id: warehouse_id
            },
            relations: {
                drivers: true
            }
        });
        if (!warehouse) throw new NotFoundException("Warehouse not found");

        const driver = await this.driver_repo.findOne({ where: { id: driver_id } });
        if (!driver) throw new NotFoundException("Driver not found");

        const isDriverAttached = warehouse.drivers.some(d => d.id === driver_id);
        if (isDriverAttached) {
            throw new BadRequestException("Driver already attached to warehouse");
        }

        if (driver.warehouse_id !== null) {
            throw new BadRequestException("Driver already attached to warehouse");
        }

        warehouse.drivers.push(driver);
        return await this.warehouse_repo.save(warehouse);
    }
}
