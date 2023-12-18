  import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Scope } from '@nestjs/common/interfaces/scope-options.interface';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { DataSource, EntityManager } from 'typeorm';
import { UpdateVehicleRequest } from '../../dto/requests/update-vehicle.request';
import { BaseTransaction } from 'src/core/base/database/base.transaction';
import { Vehicle } from 'src/infrastructure/entities/vehicle/vehicle.entity';
import { ensureFilesExists, moveTmpFiles } from 'src/core/helpers/file.helper';

import { VehicleImage } from 'src/infrastructure/entities/vehicle/vehicle-image.entity';
import { ColorService } from 'src/modules/color/color.service';

@Injectable({ scope: Scope.REQUEST })
export class UpdateVehicleTransaction extends BaseTransaction<
  UpdateVehicleRequest,
  Vehicle
> {
  constructor(
    dataSource: DataSource,
    @Inject(ConfigService) private readonly config: ConfigService,
    @Inject(ColorService) private readonly colorService: ColorService,
  ) {
    super(dataSource);
  }

  // the important thing here is to use the manager that we've created in the base class
  protected async execute(
    req: UpdateVehicleRequest,
    context: EntityManager,
  ): Promise<Vehicle> {
    try {
      // get vehicle
      let vehicle = await context.findOne(Vehicle, {
        where: { id: req.id },
      });

      vehicle = plainToInstance(Vehicle, req);
      const { color_id } = req;

      const get_color = await this.colorService.getSingleColor(color_id);
      vehicle.color_id = get_color.id;
      


 
      



      return await context.save(vehicle);
    } catch (error) {
      throw new BadRequestException(
        this.config.get('app.env') === 'local'
          ? error.message
          : 'message.vehicle_update_failed',
        {
          cause: error,
        },
      );
    }
  }
}
