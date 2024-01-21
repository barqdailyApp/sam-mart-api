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

@Injectable()
export class WarehouseService extends BaseService<Warehouse> {

    constructor(
        @InjectRepository(Warehouse) private readonly warehouse_repo: Repository<Warehouse>,
        private readonly warehouseOperationTransaction: WarehouseOperationTransaction,
        @Inject(RegionService) private readonly regionService: RegionService,
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

        const fromWarehouseProduct = await this.warehouseProducts_repo.findOne({ where: { id: from_warehouse_product_id } });

        if (!fromWarehouseProduct) {
            throw new NotFoundException("Warehouse product not found");
        }

        if (fromWarehouseProduct.quantity < quantity) {
            throw new BadRequestException("Product quantity is less than transferred quantity");
        }

        let toWarehouseProduct = await this.warehouseProducts_repo.findOne({
            where: {
                warehouse_id: to_warehouse_id,
                product_id: fromWarehouseProduct.product_id,
                product_measurement_id: fromWarehouseProduct.product_measurement_id
            }
        });

        if (toWarehouseProduct) {
            toWarehouseProduct.quantity += quantity;
        } else {
            const toWarehouse = await this.warehouse_repo.findOne({ where: { id: to_warehouse_id } });
            if (!toWarehouse) {
                throw new NotFoundException("Warehouse not found");
            }

            toWarehouseProduct = this.warehouseProducts_repo.create({
                warehouse_id: to_warehouse_id,
                product_id: fromWarehouseProduct.product_id,
                quantity,
                product_measurement_id: fromWarehouseProduct.product_measurement_id,
            });
        }

        fromWarehouseProduct.quantity -= quantity;

        await this.warehouseProducts_repo.save(toWarehouseProduct);

        if (fromWarehouseProduct.quantity === 0) {
            await this.warehouseProducts_repo.delete(from_warehouse_product_id);
        } else {
            return await this.warehouseProducts_repo.save(fromWarehouseProduct);
        }
    }
}
