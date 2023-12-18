import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/core/base/service/service.base';
import { PackagesServices } from 'src/infrastructure/entities/package/packages-services';
import { Repository } from 'typeorm';
import { CreatePackageServicesRequest } from './dto/create-package-services.request';
import { PackageService } from '../package/package.service';
import { Service } from 'src/infrastructure/entities/package/service.entity';
import { ServiceService } from '../service/service.service';
import { Package } from 'src/infrastructure/entities/package/package.entity';
import { plainToInstance } from 'class-transformer';
import { PackageServiceResponse } from './dto/package-services.response';
import { ServiceResponse } from '../service/dto/service.response';
import { UpdatePackageServicesRequest } from './dto/update-package-services.request';
import { AddServiceToPackageTransaction } from './utils/add-service-to-package.transaction';
import { UpdateServiceToPackageTransaction } from './utils/update-service-to-package.transaction';

@Injectable()
export class PackageServicesService extends BaseService<PackagesServices> {
  constructor(
    @InjectRepository(PackagesServices)
    public packagesServicesRepository: Repository<PackagesServices>,
    @Inject(PackageService) private readonly packageService: PackageService,
    @Inject(ServiceService) private readonly serviceService: ServiceService,
    @Inject(AddServiceToPackageTransaction)
    private readonly addServiceToPackageTransaction: AddServiceToPackageTransaction,
    @Inject(UpdateServiceToPackageTransaction)
    private readonly updateServiceToPackageTransaction: UpdateServiceToPackageTransaction,
  ) {
    super(packagesServicesRepository);
  }

  async addServiceToPackage(
    req: CreatePackageServicesRequest,
  ): Promise<PackagesServices> {
    const add_service_to_package = await this.addServiceToPackageTransaction.run(req);
    return add_service_to_package;
  }
  async updateDetailsPackageService(

    req: UpdatePackageServicesRequest,
  ) {
    const get_package_service = await this.updateServiceToPackageTransaction.run(req);

    
    return await this.packageService.getSinglePackage(
      get_package_service.package_id,
    );
  }
  async deletePackageService(package_id: string, service_id: string) {
    await this.packageService.getSinglePackage(package_id);
    await this.serviceService.getSingleService(service_id);

    const get_package_service = await this._repo.findOne({
      where: { package_id, service_id },
    });
    if (!get_package_service) {
      throw new NotFoundException(
        "message.package_not_found",
      );
    }

    return await this._repo.delete(get_package_service.id);
  }
}
