import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BaseTransaction } from 'src/core/base/database/base.transaction';
import { DataSource, EntityManager } from 'typeorm';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';

import { plainToInstance } from 'class-transformer';
import { Product } from 'src/infrastructure/entities/product/product.entity';

import { StorageManager } from 'src/integration/storage/storage.manager';
import { ImageManager } from 'src/integration/sharp/image.manager';
import * as sharp from 'sharp';
import { ProductImage } from 'src/infrastructure/entities/product/product-image.entity';
import { ProductMeasurement } from 'src/infrastructure/entities/product/product-measurement.entity';
import { MeasurementUnitService } from 'src/modules/measurement-unit/measurement-unit.service';

import {
  ensureFilesExists,
  moveTmpFile,
  moveTmpFiles,
} from 'src/core/helpers/file.helper';
import { WarehouseOperationRequest } from '../dto/requests/warehouse-operation.request';
import { WarehouseOperations } from 'src/infrastructure/entities/warehouse/warehouse-opreations.entity';
import { operationType } from 'src/infrastructure/data/enums/operation-type.enum';
import { WarehouseProducts } from 'src/infrastructure/entities/warehouse/warehouse-products.entity';
import { where } from 'sequelize';

@Injectable()
export class WarehouseOperationTransaction extends BaseTransaction<
  WarehouseOperationRequest,
  WarehouseOperations
> {
  constructor(
    dataSource: DataSource,
    @Inject(REQUEST) readonly request: Request,
  ) {
    super(dataSource);
  }

  // the important thing here is to use the manager that we've created in the base class
  protected async execute(
    request: WarehouseOperationRequest,
    context: EntityManager,
  ): Promise<WarehouseOperations> {
    const warehouseOperation = plainToInstance(WarehouseOperations, request);
    warehouseOperation.user_id=this.request.user.id
    const product_measurement = await context.find(ProductMeasurement, {
      where: {
        product_id: request.product_id,
      },
    });
    const passed_measurement = product_measurement.filter(
      (product_measurement) =>
        product_measurement.id === request.product_measurement_id,
    )[0];
    const base_measurement = product_measurement.filter(
      (product_measurement) => product_measurement.is_main_unit === true,
    )[0];

    let quantity =
      passed_measurement == base_measurement
        ? request.quantity
        : passed_measurement.conversion_factor * request.quantity;
quantity=operationType.IMPORT==request.type?quantity:quantity*-1
        
    warehouseOperation.quantity =
 quantity;

    warehouseOperation.product_measurement_id = base_measurement.id;
    await context.save(warehouseOperation);


const warehouseProducts= await context.findOne(WarehouseProducts,{where:{warehouse_id:request.warehouse_id,product_id:request.product_id}})
if( warehouseProducts==null && quantity<0 || warehouseProducts==null?0: warehouseProducts.quantity+quantity<0)
{
    throw new BadRequestException('warehouse doesnt have enough products')
}


if(warehouseProducts)
{
    warehouseProducts.quantity=warehouseProducts.quantity+quantity
    await context.save(warehouseProducts)
}
else 
{

   
    await context.save(new WarehouseProducts({warehouse_id:request.warehouse_id,product_id:request.product_id,quantity:quantity,product_measurement_id:base_measurement.id}))
}

    return warehouseOperation
  }
}
