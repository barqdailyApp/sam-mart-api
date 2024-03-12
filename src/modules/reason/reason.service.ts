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
        const reasons = await this.reasonRepository.find({
            where: {
                type: query.type,
                roles: currentUserRole.includes(Role.ADMIN) ? undefined : currentUserRole[0],
            }
        });

        return reasons;
    }

    get currentUser() {
        return this.request.user;
    }

}
