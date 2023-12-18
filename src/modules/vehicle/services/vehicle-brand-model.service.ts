import { Injectable, NotFoundException, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/core/base/service/service.base';
import { VehicleBrandModel } from 'src/infrastructure/entities/vehicle/vehicle-brand-model.entity';
import { DeleteResult, Repository } from 'typeorm';

@Injectable({ scope: Scope.REQUEST })
export class VehicleBrandModelService extends BaseService<VehicleBrandModel> {
  constructor(
    @InjectRepository(VehicleBrandModel)
    public _repo: Repository<VehicleBrandModel>
  ) {
    super(_repo);
  }

  override async create(
    entity: VehicleBrandModel,
  ): Promise<VehicleBrandModel> {
    return await super.create(entity);
  }

  override async delete(id: string): Promise<DeleteResult> {
    const item = await super.findOne(id);
    if (!item) throw new NotFoundException("message.vehicle_brand_model_not_found");
    return await super.delete(id);
  }
}
