import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TermsConditions } from 'src/infrastructure/entities/terms-conditions/terms-conditions.entity';
import { Repository } from 'typeorm';
import { UpdateTermsRequest } from './dto/update-terms.request';
import { CreateTermsRequest } from './dto/create-terms.request';

@Injectable()
export class TermsConditionsService {
  constructor(
    @InjectRepository(TermsConditions)
    private _repo: Repository<TermsConditions>,
  ) {}

  async getTermsConditions(): Promise<TermsConditions[]> {
    return await this._repo.find();
  }
  async createTermsConditions(
    createTermsRequest: CreateTermsRequest,
  ): Promise<TermsConditions> {
    const create_terms_Condition = this._repo.create(createTermsRequest);
    return await this._repo.save(create_terms_Condition);
  }

  async UpdateTermsCondition(
    id: string,
    updateTermsRequest: UpdateTermsRequest,
  ): Promise<TermsConditions> {
    await this.getSingleTermCondition(id);
    await this._repo.update(id, updateTermsRequest);
    return await this.getSingleTermCondition(id);
  }
  private async getSingleTermCondition(id: string): Promise<TermsConditions> {
    const get_term_condition = await this._repo.findOne({
      where: { id },
    });
    if (!get_term_condition) {
      throw new NotFoundException(
        "message.term_condition_not_found",
      );
    }
    return get_term_condition;
  }
  async deleteTermCondition(id: string) {
    await this.getSingleTermCondition(id);
    return await this._repo.delete(id);
  }
}
