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
import { PackagesServices } from 'src/infrastructure/entities/package/packages-services';
import { PackageService } from 'src/modules/package/package.service';
import { ServiceService } from 'src/modules/service/service.service';
import { UpdateServiceRequest } from '../dto/update-service.request';
import { Service } from 'src/infrastructure/entities/package/service.entity';
import { Package } from 'src/infrastructure/entities/package/package.entity';
@Injectable()
export class UpdateServiceTransaction extends BaseTransaction<
  UpdateServiceRequest,
  Service
> {
  constructor(
    dataSource: DataSource,
    @Inject(REQUEST) readonly request: Request,
    @Inject(PackageService) private readonly packageService: PackageService,
  ) {
    super(dataSource);
  }

  // the important thing here is to use the manager that we've created in the base class
  protected async execute(
    query: UpdateServiceRequest,
    context: EntityManager,
  ): Promise<Service> {
    try {
      const { service_id, price, name_ar, name_en, duration_by_minute } = query;
      const allPackages = await this.packageService.getAllPackages();
      const serviceCurrent = await context.findOne(Service, {
        where: { id: service_id },
      });


      if (!serviceCurrent) {
        throw new NotFoundException(
          "message.service_not_found",
        );
      }

      await context.update(Service, serviceCurrent.id, {
        price,
        name_ar,
        name_en,
        duration_by_minute,
      });
      if (price) {
        for (let i = 0; i < allPackages.length; i++) {
          for (let j = 0; j < allPackages[i].package_service.length; j++) {
            if (allPackages[i].package_service[j].service_id === service_id) {
              //* Update New Price Total Price Service
              await context.update(
                PackagesServices,
                allPackages[i].package_service[j].id,
                {
                  total_price_service:
                    price * allPackages[i].package_service[j].service_count,
                },
              );
              // //* Update New Price Total Price Package
              // allPackages[i].total_price_package -=
              //   serviceCurrent.price *
              //   allPackages[i].package_service[j].service_count;
              // await context.update(Package, allPackages[i].id, {
              //   total_price_package:
              //     allPackages[i].total_price_package +
              //     price * allPackages[i].package_service[j].service_count,
              // });
            }
          }
        }
      }

      return await context.findOne(Service, {
        where: { id: service_id },
      });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
