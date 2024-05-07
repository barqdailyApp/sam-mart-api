import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/core/base/service/service.base';
import { BaseUserService } from 'src/core/base/service/user-service.base';
import { Warehouse } from 'src/infrastructure/entities/warehouse/warehouse.entity';
import { In, Repository, Like } from 'typeorm';
import { WarehouseOperationTransaction } from './util/warehouse-opreation.transaction';
import { WarehouseOperationRequest } from './dto/requests/warehouse-operation.request';
import { UpdateWarehouseRequest } from './dto/requests/update-warehouse.request';
import { RegionService } from '../region/region.service';
import {
  WarehouseTransferProductRequest,
  WarehouseTransferProductsRequest,
} from './dto/requests/warehouse-transfer-product.request';
import { WarehouseProducts } from 'src/infrastructure/entities/warehouse/warehouse-products.entity';
import { operationType } from 'src/infrastructure/data/enums/operation-type.enum';
import { Driver } from 'src/infrastructure/entities/driver/driver.entity';
import { WarehouseProductsQuery } from './dto/requests/warehouse-products-query';

@Injectable()
export class WarehouseService extends BaseService<Warehouse> {
  constructor(
    @InjectRepository(Warehouse)
    private readonly warehouse_repo: Repository<Warehouse>,
    private readonly warehouseOperationTransaction: WarehouseOperationTransaction,
    @Inject(RegionService) private readonly regionService: RegionService,
    @InjectRepository(Driver) private readonly driver_repo: Repository<Driver>,
    @InjectRepository(WarehouseProducts)
    private readonly warehouseProducts_repo: Repository<WarehouseProducts>,
  ) {
    super(warehouse_repo);
  }

  async CreateWAarehouseOperation(request: WarehouseOperationRequest) {
    return await this.warehouseOperationTransaction.run(request);
  }

  async updateWarehouse(id: string, warehouse: UpdateWarehouseRequest) {
    const warehouseEntity = await this.findOne(id);
    if (!warehouseEntity) throw new NotFoundException('Warehouse not found');

    if (warehouse.region_id) {
      const region = await this.regionService.single(warehouse.region_id);
      if (!region) throw new NotFoundException('Region not found');
    }

    const updatedWarehouse = Object.assign(warehouseEntity, warehouse);
    return await this.warehouse_repo.save(updatedWarehouse);
  }

  async getWarehouseProduct(query: WarehouseProductsQuery) {
    if (!query.name) query.name = '';
    console.log(query.product_barcode)
    const products = await this.warehouseProducts_repo.findAndCount({
      where: [
        {
          warehouse_id: query.warehouse_id,
          product: {
            name_ar: Like(`%${query.name}%`),
          },
        },
        {
          warehouse_id: query.warehouse_id,
          product: {
            name_en: Like(`%${query.name}%`),
          },
        },
        {
          warehouse_id: query.warehouse_id,
          product: { barcode:Like( `%${query.product_barcode}%`)}
        },
      ],
      order: { updated_at: 'DESC' },
      relations: {
        product: { product_images: true },
        product_measurement: { measurement_unit: true },
      },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });
    return products;
  }

  async transferWarehouseProducts(
    from_warehouse_id: string,
    to_warehouse_id: string,
    transfered_products: WarehouseTransferProductsRequest,
  ) {
    const { warehouse_products } = transfered_products;

    const from_warehouse_product = await this.warehouseProducts_repo.find({
      where: {
        id: In(warehouse_products.map((p) => p.warehouse_product_id)),
        warehouse_id: from_warehouse_id,
      },
    });

    if (from_warehouse_product.length !== warehouse_products.length) {
      const noFoundWarehouseProduct = warehouse_products.filter(
        (p) =>
          !from_warehouse_product.some(
            (wp) => wp.id === p.warehouse_product_id,
          ),
      );

      throw new NotFoundException(
        `Warehouse product not found ${JSON.stringify(
          noFoundWarehouseProduct,
        )}`,
      );
    }

    const formatted_warehouse_products = warehouse_products.map((p) => {
      const product = from_warehouse_product.find(
        (wp) => wp.id === p.warehouse_product_id,
      );
      return {
        ...p,
        product_id: product.product_id,
        product_measurement_id: product.product_measurement_id,
      };
    });

    const exported_warehouse = await this.warehouseOperationTransaction.run({
      warehouse_id: from_warehouse_id,
      products: formatted_warehouse_products,
      type: operationType.EXPORT,
    });

    const imported_warehouse = await this.warehouseOperationTransaction.run({
      warehouse_id: to_warehouse_id,
      products: formatted_warehouse_products,
      type: operationType.IMPORT,
    });

    return { imported_warehouse, exported_warehouse };
  }

  async attachDriverToWarehouse(driver_id: string, warehouse_id: string) {
    const warehouse = await this.warehouse_repo.findOne({
      where: {
        id: warehouse_id,
      },
      relations: {
        drivers: true,
      },
    });
    if (!warehouse) throw new NotFoundException('Warehouse not found');

    const driver = await this.driver_repo.findOne({ where: { id: driver_id } });
    if (!driver) throw new NotFoundException('Driver not found');

    // const isDriverAttached = warehouse.drivers.some((d) => d.id === driver_id);
    // if (isDriverAttached) {
    //   throw new BadRequestException('Driver already attached to warehouse');
    // }

    // if (driver.warehouse_id !== null) {
    //   throw new BadRequestException('Driver already attached to warehouse');
    // }

    warehouse.drivers.push(driver);
    return await this.warehouse_repo.save(warehouse);
  }
}
