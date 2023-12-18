import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Service } from 'src/infrastructure/entities/package/service.entity';
import { Repository } from 'typeorm';
import { CreateServiceRequest } from './dto/create-service.request';
import { UpdateServiceRequest } from './dto/update-service.request';
import { BaseService } from 'src/core/base/service/service.base';
import { UpdateServiceTransaction } from './utils/update-service.transaction';
import { DeleteServiceTransaction } from './utils/delete-service.transaction';

@Injectable()
export class ServiceService extends BaseService<Service> {
  constructor(
    @InjectRepository(Service)
    public serviceRepository: Repository<Service>,
    @Inject(UpdateServiceTransaction)
    private readonly updateServiceTransaction: UpdateServiceTransaction,
    @Inject(DeleteServiceTransaction)
    private readonly deleteServiceTransaction: DeleteServiceTransaction,
  ) {
    super(serviceRepository);
  }

  async createService(
    createServiceRequest: CreateServiceRequest,
  ): Promise<Service> {
    //* Create Service (Entity)
    const create_service: Service = this._repo.create(createServiceRequest);

    return await this._repo.save(create_service);
  }

  async updateService(req: UpdateServiceRequest) {
    const service = await this.updateServiceTransaction.run(req);
    return service;
  }

  async getSingleService(id: string): Promise<Service> {
    const get_service = await this._repo.findOne({ where: { id } });
    if (!get_service) {
  throw new NotFoundException("message.service_not_found");
    }
    return get_service;
  }

  async getAllServices(): Promise<Service[]> {
    const all_services = await this._repo.find();
    return all_services;
  }

  async deleteService(id: string) {
    const service = await this.deleteServiceTransaction.run(id);
    return service;
  }
}
