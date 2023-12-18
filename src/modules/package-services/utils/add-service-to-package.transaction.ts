import { BadRequestException, Inject, Injectable } from '@nestjs/common';
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
@Injectable()
export class AddServiceToPackageTransaction extends BaseTransaction<
  CreatePackageServicesRequest,
  PackagesServices
> {
  constructor(
    dataSource: DataSource,
    @Inject(REQUEST) readonly request: Request,
    @Inject(PackageService) private readonly packageService: PackageService,
    @Inject(ServiceService) private readonly serviceService: ServiceService,
  ) {
    super(dataSource);
  }

  // the important thing here is to use the manager that we've created in the base class
  protected async execute(
    query: CreatePackageServicesRequest,
    context: EntityManager,
  ): Promise<PackagesServices> {
    try {
      const { package_id, service_id } = query;

      // const packageCurrent = await this.packageService.getSinglePackage(
      //   package_id,
      // );
      const serviceCurrent = await this.serviceService.getSingleService(
        service_id,
      );
      //* convert Dto To Item (Entity)
      const packagesServicesDto: PackagesServices = plainToInstance(
        PackagesServices,
        query,
      );

      //* Create Service (Entity)
      const packagesServicesCreate = context.create(
        PackagesServices,
        packagesServicesDto,
      );

      //* Get Total Service Price
      const { service_count } = query;

      packagesServicesCreate.total_price_service =
        service_count * serviceCurrent.price;

      // //* Add Total Service Price To Total Price Package, Update This Package
      // const total_price_package =
      //   parseFloat(packageCurrent.total_price_package.toString()) +
      //   packagesServicesCreate.total_price_service;
      // packageCurrent.total_price_package =total_price_package;

      // await context.save(packageCurrent);

      return await context.save(packagesServicesCreate);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
