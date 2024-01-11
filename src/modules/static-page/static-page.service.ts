import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/core/base/service/service.base';
import { Repository } from 'typeorm';
import { StaticPage } from 'src/infrastructure/entities/static-pages/static-pages.entity';

@Injectable()
export class StaticPageService extends BaseService<StaticPage> {
    constructor(
        @InjectRepository(StaticPage) private readonly staticPageRepository: Repository<StaticPage>,
    ) {
        super(staticPageRepository);
    }
}
