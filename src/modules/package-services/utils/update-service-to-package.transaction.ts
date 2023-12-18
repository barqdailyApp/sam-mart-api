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
import { Package } from 'src/infrastructure/entities/package/package.entity';

import { plainToInstance } from 'class-transformer';

import { CreatePackageServicesRequest } from '../dto/create-package-services.request';
import { PackagesServices } from 'src/infrastructure/entities/package/packages-services';
import { PackageService } from 'src/modules/package/package.service';
import { ServiceService } from 'src/modules/service/service.service';
import { UpdatePackageServicesRequest } from '../dto/update-package-services.request';
@Injectable()
export class UpdateServiceToPackageTransaction extends BaseTransaction<
  UpdatePackageServicesRequest,
  PackagesServices
> {
  constructor(
    dataSource: DataSource,
    @Inject(REQUEST) readonly request: Request,
    // @Inject(PackageService) private readonly packageService: PackageService,
    @Inject(ServiceService) private readonly serviceService: ServiceService,
  ) {
    super(dataSource);
  }

  // the important thing here is to use the manager that we've created in the base class
  protected async execute(
    query: UpdatePackageServicesRequest,
    context: EntityManager,
  ): Promise<PackagesServices> {
    try {
      const { package_id, service_id, service_count } = query;

      // const packageCurrent = await this.packageService.getSinglePackage(
      //   package_id,
      // );
      const serviceCurrent = await this.serviceService.getSingleService(
        service_id,
      );

      const get_package_service = await context.findOne(PackagesServices, {
        where: { package_id, service_id },
      });
      if (!get_package_service) {
        throw new NotFoundException(
          "message.package_not_found",
        );
      }
      if (service_count) {
        // //* Subtract Old Service Price From Package
        // packageCurrent.total_price_package -=
        //   get_package_service.total_price_service;

        //* Get New Total Service Price
        get_package_service.total_price_service =
          service_count * serviceCurrent.price;

        // //* Add New Total Service Price To Total Price Package, Update This Package
        // packageCurrent.total_price_package +=
        //   get_package_service.total_price_service;
        // await context.save(packageCurrent);
      }

      return await context.save(get_package_service);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
