import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/core/base/service/service.base';
import { Reason } from 'src/infrastructure/entities/reason/reason.entity';
import { Repository } from 'typeorm';
import { CreateReasonRequest } from './dto/request/create-reason.request';
@Injectable()
export class ReasonService extends BaseService<Reason>{
    constructor(
        @InjectRepository(Reason) private reasonRepository: Repository<Reason>,
    ) { 
        super(reasonRepository)
    }

    async createReason(req: CreateReasonRequest): Promise<Reason> {
     const createdReason = await this.reasonRepository.create(req);
     return await this.reasonRepository.save(createdReason);
    }
}
