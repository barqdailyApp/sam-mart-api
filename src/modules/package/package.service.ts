import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseUserService } from 'src/core/base/service/user-service.base';
import { Package } from 'src/infrastructure/entities/package/package.entity';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { CreatePackageRequest } from './dto/create-package.request';
import { UpdatePackageRequest } from './dto/update-package.request';
import { BaseService } from 'src/core/base/service/service.base';
import { PackagesServices } from 'src/infrastructure/entities/package/packages-services';
import { plainToInstance } from 'class-transformer';
import { PackageResponse } from './dto/package.response';

@Injectable()
export class PackageService extends BaseService<Package> {
  constructor(
    @Inject(REQUEST) request: Request,
    @InjectRepository(Package) public packageRepository: Repository<Package>,
    @InjectRepository(PackagesServices)
    public packagesServicesRepository: Repository<PackagesServices>,
  ) {
    super(packageRepository);
  }

  async createPackage(
    createPackageRequest: CreatePackageRequest,
  ): Promise<Package> {
    const create_package: Package = this._repo.create(createPackageRequest);

    // //* Get Total Quickly Wish Price
    // create_package.total_price_package =
    //   create_package.price_wash_single * create_package.wash_count;

    const save_package: Package = await this._repo.save(create_package);

    return save_package;
  }

  async updatePackage(id: string, updatePackageRequest: UpdatePackageRequest) {
    await this.getSinglePackage(id);
    await this._repo.update(id, updatePackageRequest);
    return await this._repo.findOne({
      where: { id },
    });
  }

  async getSinglePackage(id: string): Promise<Package> {
    const get_package = await this._repo.findOne({
      where: { id },
      relations: {
        package_service: {
          service: true,
        },
      },
    });
    if (!get_package) {
  throw new NotFoundException("message.package_not_found");
    }
    return get_package;
  }

  async getAllPackages(): Promise<Package[]> {
    const all_packages = await this._repo.find({
      relations: ['package_service.service'],
    });
    return all_packages;
  }

  async deletePackage(id: string) {
    await this.getSinglePackage(id);
    return await this._repo.delete(id);
  }
}
