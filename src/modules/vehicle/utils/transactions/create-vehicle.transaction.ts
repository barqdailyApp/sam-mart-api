import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Scope } from '@nestjs/common/interfaces/scope-options.interface';
import { ConfigService } from '@nestjs/config';
import { REQUEST } from '@nestjs/core';
import { plainToInstance } from 'class-transformer';
import { Request } from 'express';
import { BaseTransaction } from 'src/core/base/database/base.transaction';
import { User } from 'src/infrastructure/entities/user/user.entity';
import { Vehicle } from 'src/infrastructure/entities/vehicle/vehicle.entity';
import { DataSource, EntityManager } from 'typeorm';
import { CreateVehicleRequest } from '../../dto/requests/create-vehicle.request';
import { Customer } from 'src/infrastructure/entities/customer/customer.entity';
import { ColorService } from 'src/modules/color/color.service';

@Injectable({ scope: Scope.REQUEST })
export class CreateVehicleTransaction extends BaseTransaction<
  CreateVehicleRequest,
  Vehicle
> {
  constructor(
    dataSource: DataSource,
    @Inject(ConfigService) private readonly config: ConfigService,
    @Inject(REQUEST) private readonly request: Request,
    @Inject(ColorService) private readonly colorService: ColorService,
  ) {
    super(dataSource);
  }

  // the important thing here is to use the manager that we've created in the base class
  protected async execute(
    req: CreateVehicleRequest,
    context: EntityManager,
  ): Promise<Vehicle> {
    try {
      // get current user
      const user = (this.request as any).user as User;
      const { color_id } = req;
      const get_color = await this.colorService.getSingleColor(color_id);

      // get customer id
      const customer_id = (
        await context.findOneBy(Customer, { user_id: user.id })
      ).id;
      // create vehicle
      const vehicle = plainToInstance(Vehicle, req);
      // delete vehicle['__images__'];

      // set user_id to the user that is creating the vehicle
      vehicle.customer_id = customer_id;
      // add Color to vehicle
      vehicle.color_id = get_color.id;
      // save vehicle
      const savedVehicle = await context.save(Vehicle, vehicle);


      // save vehicle images images

      // validate images
      // ensureFilesExists(req.images);

      // // generator to move images to vehicle-images folder
      // const moveImages = moveTmpFiles(req.images, '/vehicle-images/');
      // const newImagePathes = moveImages.next().value as string[];

      // // save vehicle images images
      // const images = newImagePathes.map((image) => {
      //   return plainToInstance(VehicleImage, {
      //     image: image,
      //     vehicle_id: savedVehicle.id,
      //   });
      // });

      // // save vehicle images
      // await context.save(VehicleImage, images);

      // move license to vehicle-license-images folder

      // move images to vehicle-images folder
      // moveImages.next();

      // set status
      return vehicle;
    } catch (error) {
      throw new BadRequestException(
        this.config.get('app.env') === 'local'
          ? error.message
          : 'message.vehicle_registration_failed',
        {
          cause: error,
        },
      );
    }
  }
}
