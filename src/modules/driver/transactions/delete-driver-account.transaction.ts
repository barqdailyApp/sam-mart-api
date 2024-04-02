import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { BaseTransaction } from 'src/core/base/database/base.transaction';

import { UserService } from 'src/modules/user/user.service';
import { DataSource, EntityManager, In, UpdateResult } from 'typeorm';

import { User } from 'src/infrastructure/entities/user/user.entity';

import { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { ShipmentStatusEnum } from 'src/infrastructure/data/enums/shipment_status.enum';
import { Driver } from 'src/infrastructure/entities/driver/driver.entity';
import { Shipment } from 'src/infrastructure/entities/order/shipment.entity';
@Injectable()
export class DeleteDriverAccountTransaction extends BaseTransaction<
  { driver_id: string },
  Driver
> {
  constructor(
    dataSource: DataSource,
    @Inject(REQUEST) readonly request: Request,
  ) {
    super(dataSource);
  }

  // the important thing here is to use the manager that we've created in the base class
  protected async execute(
    req: { driver_id: string },
    context: EntityManager,
  ): Promise<Driver> {
    try {
      const timesTampDeleted = new Date().getTime();
      const driver = await context.findOne(Driver, {
        where: { id: req.driver_id },
        relations: { user: true },
      });
      if (!driver) throw new NotFoundException('driver not found');
      const ordersActive = await context.count(Shipment, {
        where: {
          status: In([
            ShipmentStatusEnum.CONFIRMED,
            ShipmentStatusEnum.PROCESSING,
            ShipmentStatusEnum.PICKED_UP,
            ShipmentStatusEnum.READY_FOR_PICKUP,
          ]),
          driver_id: driver.id,
          warehouse_id: driver.warehouse_id,
        },
      });
      if (ordersActive > 0) {
        throw new Error('message.driver_has_active_orders');
      }
      await context.update(
        User,
        { id: driver.user_id },
        {
          username: `${driver.user.name}_${timesTampDeleted}`,
          phone: `${driver.user.phone}_${timesTampDeleted}`,
        },
      );

      await context.softDelete(Driver, { id: req.driver_id });
      await context.softDelete(User, { id: driver.user_id });

      return await context.findOne(Driver, {
        where: { id: req.driver_id },
      });
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }
  }
}
