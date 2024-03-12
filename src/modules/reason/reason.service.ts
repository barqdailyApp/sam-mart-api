import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Reason } from 'src/infrastructure/entities/reason/reason.entity';
import { Repository } from 'typeorm';
@Injectable()
export class ReasonService {
    constructor(
        @InjectRepository(Reason) private reasonRepository: Repository<Reason>,
    ) { }
}
