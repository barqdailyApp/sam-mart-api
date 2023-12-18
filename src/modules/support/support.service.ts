import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Support } from 'src/infrastructure/entities/support/support.entity';
import { UpdateSupportRequest } from './dto/update-support.request';

@Injectable()
export class SupportService {
  constructor(
    @InjectRepository(Support)
    private _repo: Repository<Support>,
  ) {}

  async getSupport(): Promise<Support> {
    return await this._repo.createQueryBuilder('support').getOne();
  }

  async UpdateSupport(
    id: string,
    updateSupportRequest: UpdateSupportRequest,
  ): Promise<Support> {
    await this.getSingleSupport(id);
    await this._repo.update(id, updateSupportRequest);
    return await this.getSingleSupport(id);
  }
  private async getSingleSupport(id: string): Promise<Support> {
    const get_term_condition = await this._repo.findOne({
      where: { id },
    });
    if (!get_term_condition) {
      throw new NotFoundException(
        "message.support_not_found",
      );
    }
    return get_term_condition;
  }
  async deleteSupport(id: string) {
    await this.getSingleSupport(id);
    return await this._repo.delete(id);
  }
}
