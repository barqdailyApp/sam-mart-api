import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/core/base/service/service.base';
import { Reason } from 'src/infrastructure/entities/reason/reason.entity';
import { Repository } from 'typeorm';
import { CreateReasonRequest } from './dto/request/create-reason.request';
import { GetReasonQueryRequest } from './dto/request/get-reason-query.requst';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { UpdateReasonRequest } from './dto/request/update-reason.request';

@Injectable()
export class ReasonService extends BaseService<Reason>{
    constructor(
        @InjectRepository(Reason) private reasonRepository: Repository<Reason>,
        @Inject(REQUEST) private readonly request: Request,
    ) {
        super(reasonRepository)
    }

    async createReason(req: CreateReasonRequest): Promise<Reason> {
        const createdReason = await this.reasonRepository.create(req);
        return await this.reasonRepository.save(createdReason);
    }

    async getAll(query: GetReasonQueryRequest): Promise<Reason[]> {
        const currentUserRole = this.currentUser.roles;
        let reasons = await this.reasonRepository.find({
            where: {
                type: query.type,
            }
        });

        if (!currentUserRole.includes(Role.ADMIN)) {
            reasons = reasons.filter(reason => reason.roles.some(role => currentUserRole.includes(role)));
        }
        
        return reasons;
    }

    async updateReason(id: string, req: UpdateReasonRequest): Promise<Reason> {

        const reason = await this.findOne(id);
        if (!reason) {
            throw new NotFoundException(`Reason with id ${id} not found`);
        }

        Object.assign(reason, req);
        const updatedReason = await this.reasonRepository.save(reason);

        return updatedReason;
    }

    get currentUser() {
        return this.request.user;
    }

}
