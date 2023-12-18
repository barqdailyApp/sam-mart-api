import { Inject, Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StorageManager } from 'src/integration/storage/storage.manager';
import { BaseService } from 'src/core/base/service/service.base';
import { Banner } from 'src/infrastructure/entities/banner/banner';
import { UploadFileRequest } from '../file/dto/requests/upload-file.request';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { FileService } from '../file/file.service';
import { CreateBannerRequest } from './dto/requests/create-banner-request';
import { ImageManager } from 'src/integration/sharp/image.manager';

import * as sharp from 'sharp';
import { ConfigService } from '@nestjs/config';
@Injectable({ scope: Scope.REQUEST })
export class BannerService extends BaseService<Banner> {
  constructor(
    @Inject(FileService) private _fileService: FileService,
    @InjectRepository(Banner) private bannerRepository: Repository<Banner>,
    @Inject(REQUEST) readonly request: Request,
    @Inject(StorageManager) private readonly storageManager: StorageManager,
    @Inject(ImageManager) private readonly imageManager: ImageManager,
    @Inject(ConfigService) private readonly config: ConfigService,
  ) {
    super(bannerRepository);
  }

  async createBanner(req: CreateBannerRequest): Promise<Banner> {
    const banner = new Banner();
    const resizedImage = await this.imageManager.resize(req.file, {
      size: {},
      options: {
        fit: sharp.fit.cover,
        position: sharp.strategy.entropy,
      },
    });

    // save image
    const path = await this.storageManager.store(
      { buffer: resizedImage, originalname: req.file.originalname },
      { path: 'banners' },
    );

    // set avatar path
    banner.image = path;
    banner.name = req.name;
    banner.end_time = req.end_time;
    await this.bannerRepository.save(banner);
    return banner;
  }

  async updateImage(banner: Banner, req: CreateBannerRequest) {
    const tempImage = await this._fileService.upload(req, 'banners');

    if (tempImage) {
      if (banner.image) await this._fileService.delete(banner.image);
      banner.image = tempImage;
      await super.update(banner);
    }
    return banner;
  }

  async getAllBanner() {
    const today = new Date();
    return await this.bannerRepository
      .createQueryBuilder('banner')
      .where('banner.end_time > :today', { today }).orderBy('banner.order', 'ASC')
      .getMany();
  }
}
