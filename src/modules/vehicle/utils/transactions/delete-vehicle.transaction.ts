import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Scope } from '@nestjs/common/interfaces/scope-options.interface';
import { ConfigService } from '@nestjs/config';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { BaseTransaction } from 'src/core/base/database/base.transaction';

import { User } from 'src/infrastructure/entities/user/user.entity';
import { Vehicle } from 'src/infrastructure/entities/vehicle/vehicle.entity';
import { DataSource, EntityManager } from 'typeorm';

@Injectable({ scope: Scope.REQUEST })
export class DeleteVehicleTransaction extends BaseTransaction<
  string,
  Vehicle
> {
  constructor(
    dataSource: DataSource,
    @Inject(ConfigService) private readonly config: ConfigService,
    @Inject(REQUEST) private readonly request: Request,
  ) {
    super(dataSource);
  }

  // the important thing here is to use the manager that we've created in the base class
  protected async execute(
    req: string,
    context: EntityManager,
  ): Promise<Vehicle> {
    try {
      const user = (this.request as any).user as User;
      // get vehicle
      const vehicle = await context.findOne(Vehicle, {
        where: { id: req },
      });

      if (!vehicle) throw new BadRequestException('message.vehicle_not_found');

      // delete vehicle
      vehicle.deleted_at = new Date();

   

      return await context.save(vehicle);
    } catch (error) {
      throw new BadRequestException(
        this.config.get('app.env') === 'local'
          ? error.message
          : 'message.vehicle_delete_failed',
        {
          cause: error,
        },
      );
    }
  }
}
