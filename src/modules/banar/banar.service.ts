import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/core/base/service/service.base';
import { LessThan, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { Banar } from 'src/infrastructure/entities/banar/banar.entity';
import { CreateBanarRequest } from './dto/request/create-banar.request';
import { FileService } from '../file/file.service';
import { UploadFileRequest } from '../file/dto/requests/upload-file.request';
import { UpdateBannerRequest } from './dto/request/update-banner.request';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { User } from 'src/infrastructure/entities/user/user.entity';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { BannerQuery } from './dto/filters/banners.query';

@Injectable()
export class BanarService extends BaseService<Banar> {
    constructor(
        @InjectRepository(Banar) private readonly banarRepository: Repository<Banar>,
        @Inject(FileService) private _fileService: FileService,
        @Inject(REQUEST) private readonly request: Request

    ) {
        super(banarRepository);
    }

    async createBanar(banar: CreateBanarRequest) {
        const tempImage = await this._fileService.upload(
            banar.banar,
            `banars`,
        );

        let createdBanar = this.banarRepository.create({
            banar: tempImage,
            started_at: banar.started_at,
            ended_at: banar.ended_at,
            is_active: banar.is_active,
        });

        return await this.banarRepository.save(createdBanar);
    }

    async getBanars(bannerQuery:BannerQuery) {
        const { page, limit } = bannerQuery;
        const skip = (page - 1) * limit;

        console.log(this.currentUser)
        if (this.currentUser?.roles.includes(Role.ADMIN)) {
            // Admins get all banners without any conditions
            return await this.banarRepository
                .createQueryBuilder('banar')
                .skip(skip)
                .take(limit)
                .getManyAndCount();
        } else {
            // Non-admin users get only active banners within the valid date range
            return await this.banarRepository
                .createQueryBuilder('banar')
                .where('banar.is_active = :isActive', { isActive: true })
                .andWhere('banar.started_at <= :currentDate', { currentDate: new Date() })
                .andWhere('banar.ended_at >= :currentDate', { currentDate: new Date() })
                .skip(skip)
                .take(limit)
                .getManyAndCount();
        }
    }

    async updateBanar(id: string, banar: UpdateBannerRequest) {
        let tempImage = null;
        const banarEntity = await this.banarRepository.findOne({ where: { id } });
        if (!banarEntity) {
            throw new NotFoundException("message.banner_not_found");
        }

        if (banar.banar) {
            tempImage = await this._fileService.upload(
                banar.banar,
                `banars`,
            );
        }

        Object.assign(banarEntity, {
            banar: banar.banar ? tempImage : banarEntity.banar,
            started_at: banar.started_at ? banar.started_at : banarEntity.started_at,
            ended_at: banar.ended_at ? banar.ended_at : banarEntity.ended_at,
            is_active: banar.is_active != null ? banar.is_active : banarEntity.is_active,
        });

        return await this.banarRepository.save(banarEntity);
    }

    async deleteBanar(id: string) {
        const banar = await this.banarRepository.findOne({ where: { id } });
        if (!banar) {
            throw new NotFoundException("message.banner_not_found");
        }
        return await this.banarRepository.remove(banar);
    }

    get currentUser(): User {
        return this.request.user;
    }
}
