import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/core/base/service/service.base';
import { Reason } from 'src/infrastructure/entities/reason/reason.entity';
import { ILike, Like, Repository } from 'typeorm';
import { CreateReasonRequest } from './dto/request/create-reason.request';
import { GetReasonQueryRequest } from './dto/request/get-reason-query.requst';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { UpdateReasonRequest } from './dto/request/update-reason.request';
import { GetReasonByNameQueryRequest } from './dto/request/get-reason-by-name-query.request';

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

    async getAll(query: GetReasonQueryRequest)
        : Promise<
            {
                total: number,
                reasons: Reason[]
            }
        > {
        const { type, page, limit } = query;
        let total = 0;
        const currentUserRole = this.currentUser.roles;
        let reasons = await this.reasonRepository.find({
            where: {
                type,
            },
        });

        if (!currentUserRole.includes(Role.ADMIN)) {
            reasons = reasons.filter(reason => reason.roles.some(role => currentUserRole.includes(role)));
        }
        total = reasons.length;

        if (page && limit) {
            const offset = (page - 1) * limit;
            reasons = reasons.slice(offset, offset + limit);
        }

        return { total, reasons };
    }

    async getReasonByName(query: GetReasonByNameQueryRequest): Promise<[Reason[], number]> {
        const { name, page, limit, type } = query;
        const [reasons, count] = await this.reasonRepository.findAndCount({
            where: [
                {
                    type,
                    name_en: Like(`%${name}%`),
                },
                {
                    type,
                    name_ar: Like(`%${name}%`),
                }
            ],
            skip: (page - 1) * limit,
            take: limit,
        });

        if (!reasons.length) {
            throw new NotFoundException(`Reason with name ${name} not found`);
        }

        return [reasons, count];
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

    async deleteReason(id: string): Promise<boolean> {
        const reason = await this.findOne(id);
        if (!reason) {
            throw new NotFoundException(`Reason with id ${id} not found`);
        }

        const deletedReason = await this.reasonRepository.delete(id);
        return deletedReason.affected > 0;
    }

    async getSingleReason(id: string): Promise<Reason> {
        const reason = await this.findOne(id);
        if (!reason) {
            throw new NotFoundException(`Reason with id ${id} not found`);
        }

        return reason;
    }

    get currentUser() {
        return this.request.user;
    }

}
