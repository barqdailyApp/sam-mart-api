import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/core/base/service/service.base';
import { LessThan, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { Banar } from 'src/infrastructure/entities/banar/banar.entity';
import { CreateBanarRequest } from './dto/request/create-banar.request';
import { FileService } from '../file/file.service';
import { UploadFileRequest } from '../file/dto/requests/upload-file.request';

@Injectable()
export class BanarService extends BaseService<Banar> {
    constructor(
        @InjectRepository(Banar) private readonly banarRepository: Repository<Banar>,
        @Inject(FileService) private _fileService: FileService,
    ) {
        super(banarRepository);
    }

    async createBanar(banar: CreateBanarRequest) {
        const tempImage = await this._fileService.upload(
            banar.banar,
            `banars/`,
        );

        let createdBanar = this.banarRepository.create({
            banar: tempImage,
            started_at: banar.started_at,
            ended_at: banar.ended_at,
            is_active: banar.is_active,
        });

        return await this.banarRepository.save(createdBanar);
    }

    async getBanars() {
        return await this.banarRepository.find({ 
            where: { 
                is_active: true,
                started_at: LessThanOrEqual(new Date()),
                ended_at: MoreThanOrEqual(new Date())

            }
        });
    }
}
