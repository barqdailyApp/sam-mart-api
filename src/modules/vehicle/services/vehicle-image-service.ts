import { Injectable, NotFoundException, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/core/base/service/service.base';
import { VehicleImage } from 'src/infrastructure/entities/vehicle/vehicle-image.entity';
import { DeleteResult, Repository } from 'typeorm';

@Injectable({ scope: Scope.REQUEST })
export class VehicleImageService extends BaseService<VehicleImage> {
  constructor(
    @InjectRepository(VehicleImage)
    public _repo: Repository<VehicleImage>
  ) {
    super(_repo);
  }

  override async delete(id: string): Promise<DeleteResult> {
    const item = await super.findOne(id);
    if (!item) throw new NotFoundException("message.vehicle_brand_not_found");
    return await super.delete(id);
  }
}
