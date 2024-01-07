import { Injectable, NotFoundException } from '@nestjs/common';
import { Region } from 'src/infrastructure/entities/region/region.entity';
import { CreateRegionRequest } from './dto/requests/create-region.request';
import { UpdateRegionRequest } from './dto/requests/update-region.request';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class RegionService {
  constructor(
    @InjectRepository(Region)
    private regionRepository: Repository<Region>,
  ) {}

  async create(createRegionRequest: CreateRegionRequest): Promise<Region> {
    const newRegion = this.regionRepository.create(createRegionRequest);
    return await this.regionRepository.save(newRegion);
  }
  async single(region_id: string): Promise<Region> {
    const region = await this.regionRepository.findOne({
      where: { id: region_id },
      relations: {
        city: {
          country: true,
        },
      },
    });
    if (!region) {
      throw new NotFoundException('message.region_not_found');
    }
    return region;
  }
  async allRegionsCity(city_id: string): Promise<Region[]> {
    return await this.regionRepository.find({
      where: { city_id: city_id },
      relations: {
        city: {
          country: true,
        },
      },
    });
  }

  async update(
    region_id: string,
    updateRegionRequest: UpdateRegionRequest,
  ): Promise<UpdateResult> {
    await this.single(region_id);
    return await this.regionRepository.update(
      { id: region_id },
      updateRegionRequest,
    );
  }
  async delete(region_id: string): Promise<DeleteResult> {
    await this.single(region_id);
    return await this.regionRepository.delete({ id: region_id });
  }
}
