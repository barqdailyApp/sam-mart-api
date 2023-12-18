import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/core/base/service/service.base';
import { SocialMedia } from 'src/infrastructure/entities/social-media/social-media.entity';
import { Repository } from 'typeorm';
import { UpdateSocialRequest } from './dto/update-social.request';
import { CreateSocialRequest } from './dto/create-social.request';

@Injectable()
export class SocialMediaService extends BaseService<SocialMedia> {
  constructor(
    @InjectRepository(SocialMedia)
    public socialMediaRepository: Repository<SocialMedia>,
  ) {
    super(socialMediaRepository);
  }

  async createSocialMedia(
    createSocialRequest: CreateSocialRequest,
  ): Promise<SocialMedia> {
    const create_social_media = this._repo.create(createSocialRequest);
    const saved_social_media = await this._repo.save(create_social_media);
    return saved_social_media;
  }

  async updateSocialMedia(
    id: string,
    updateSocialRequest: UpdateSocialRequest,
  ) {
    await this.getSingleSocialMedia(id);
    await this._repo.update(id, updateSocialRequest);
    return await this.getSingleSocialMedia(id);
  }

  async getSingleSocialMedia(id: string): Promise<SocialMedia> {
    const get_service = await this._repo.findOne({ where: { id } });
    if (!get_service) {
      throw new NotFoundException("message.social_media_not_found");
    }
    return get_service;
  }

  async getAllSocialMedias(): Promise<SocialMedia[]> {
    const all_services = await this._repo.find();
    return all_services;
  }

  async deleteSocialMedia(id: string) {
    await this.getSingleSocialMedia(id);
    return await this._repo.delete(id);
  }
}
