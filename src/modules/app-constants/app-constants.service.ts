import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppConstants } from 'src/infrastructure/entities/app-constants/app-constants.entity';
import { Repository } from 'typeorm';
import { UpdateAppConstantsRequest } from './dto/update-app-constants.request';

@Injectable()
export class AppConstantsService {
    constructor(
        @InjectRepository(AppConstants)
        private _repo: Repository<AppConstants>,
      ) {}

      async getAppConstants(): Promise<AppConstants> {
        return await this._repo.createQueryBuilder('app-constants').getOne();
      }
      async updateAppConstants(
        updateAppConstantsRequest: UpdateAppConstantsRequest,
      ): Promise<AppConstants> {
        const app_constants: AppConstants = await this._repo
          .createQueryBuilder('app-constants')
          .getOne();
    
        await this._repo.update(app_constants.id, updateAppConstantsRequest);
        return await this.getAppConstants();
      }
}
