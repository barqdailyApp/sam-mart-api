import { Injectable, NotFoundException, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedRequest } from 'src/core/base/requests/paginated.request';
import { BaseService } from 'src/core/base/service/service.base';
import { VehicleBrand } from 'src/infrastructure/entities/vehicle/vehicle-brand.entity';
import { DeleteResult, Repository } from 'typeorm';

@Injectable({ scope: Scope.REQUEST })
export class VehicleBrandService extends BaseService<VehicleBrand> {
  constructor(
    @InjectRepository(VehicleBrand)
    public _repo: Repository<VehicleBrand>
  ) {
    super(_repo);
  }

  override async findAll(
    query?: PaginatedRequest,
  ): Promise<VehicleBrand[]> {
    return await super.findAll(query);
  }

  override async findOne(id: string): Promise<VehicleBrand> {
    const item = await super.findOne(id);
    return item;
  }
  override async create(
    entity: VehicleBrand,
  ): Promise<VehicleBrand> {
    entity.is_active = true;
    return await super.create(entity);
  }

  override async update(
    entity: VehicleBrand,
  ): Promise<VehicleBrand> {
    entity.is_active = true;
    return await super.update(entity);
  }

  override async delete(id: string): Promise<DeleteResult> {
    const item = await super.findOne(id);
    if (!item) throw new NotFoundException();
    return await super.delete(id);
  }
}
