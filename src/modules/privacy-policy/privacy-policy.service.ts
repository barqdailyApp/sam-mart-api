import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdatePrivacyPolicyRequest } from './dto/update-privacy-policy.request';
import { PrivacyPolicy } from 'src/infrastructure/entities/privacy-policy/privacy-policy.entity';
import { CreatePrivacyPolicyRequest } from './dto/create-privacy-policy.request';

@Injectable()
export class PrivacyPolicyService {
  constructor(
    @InjectRepository(PrivacyPolicy)
    private _repo: Repository<PrivacyPolicy>,
  ) {}

  async getPrivacyPolicy(): Promise<PrivacyPolicy[]> {
    return await this._repo.find();
  }
  async createTermsConditions(
    createPrivacyPolicyRequest: CreatePrivacyPolicyRequest,
  ): Promise<PrivacyPolicy> {
    const create_privacy_policy = this._repo.create(createPrivacyPolicyRequest);
    return await this._repo.save(create_privacy_policy);
  }
  async UpdatePrivacyPolicy(
    id: string,
    updatePrivacyPolicyRequest: UpdatePrivacyPolicyRequest,
  ): Promise<PrivacyPolicy> {
    await this.getSinglePrivacyPolicy(id);
    await this._repo.update(id, updatePrivacyPolicyRequest);
    return await this.getSinglePrivacyPolicy(id);
  }
  private async getSinglePrivacyPolicy(id: string): Promise<PrivacyPolicy> {
    const get_privacy_policy = await this._repo.findOne({
      where: { id },
    });
    if (!get_privacy_policy) {
      throw new NotFoundException(
        "message.privacy_policy_not_found",
      );
    }
    return get_privacy_policy;
  }
  async deletePrivacyPolicy(id: string) {
    await this.getSinglePrivacyPolicy(id);
    return await this._repo.delete(id);
  }
}
