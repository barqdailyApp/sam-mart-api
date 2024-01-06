import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AdditionalService } from 'src/infrastructure/entities/product/additional-service.entity';
import { Repository, UpdateResult, DeleteResult } from 'typeorm';
import { CreateAdditionalServiceRequest } from './dto/requests/create-additional-service.request';
import { UpdateAdditionalServiceRequest } from './dto/requests/update-additional-service.request';

@Injectable()
export class AdditionalServiceService {
    constructor(
        @InjectRepository(AdditionalService)
        private additionalServiceRepository: Repository<AdditionalService>,
      ) {}
      async create(
        createAdditionalServiceRequest: CreateAdditionalServiceRequest,
      ): Promise<AdditionalService> {
        const additionalService = this.additionalServiceRepository.create(
          createAdditionalServiceRequest,
        );
        return await this.additionalServiceRepository.save(additionalService);
      }
    
      async findAll(): Promise<AdditionalService[]> {
        return await this.additionalServiceRepository.find({});
      }
      async single(additional_service_id: string): Promise<AdditionalService> {
        const additionalService = await this.additionalServiceRepository.findOne({
          where: { id: additional_service_id },
        });
        if (!additionalService) {
          throw new NotFoundException('message.additional_service_unit_not_found');
        }
        return additionalService;
      }
      async update(
        additional_service_id: string,
        updateAdditionalServiceRequestRequest: UpdateAdditionalServiceRequest,
      ): Promise<UpdateResult> {
        await this.single(additional_service_id);
    
        return await this.additionalServiceRepository.update(
          { id: additional_service_id },
          updateAdditionalServiceRequestRequest,
        );
      }
    
      async delete(additional_service_id: string): Promise<DeleteResult> {
        await this.single(additional_service_id);
        return await this.additionalServiceRepository.delete({
          id: additional_service_id,
        });
      }
}
