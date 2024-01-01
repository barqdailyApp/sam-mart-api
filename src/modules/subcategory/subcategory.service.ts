import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import * as sharp from 'sharp';
import { BaseService } from 'src/core/base/service/service.base';
import { Category } from 'src/infrastructure/entities/category/category.entity';
import { Subcategory } from 'src/infrastructure/entities/category/subcategory.entity';
import { ImageManager } from 'src/integration/sharp/image.manager';
import { Repository } from 'typeorm';
import { CreateCategoryRequest } from '../category/dto/requests/create-category-request';
import { StorageManager } from 'src/integration/storage/storage.manager';

@Injectable()
export class SubcategoryService extends BaseService<Subcategory> {
  constructor(
    @InjectRepository(Subcategory)
    private readonly subcategory_repo: Repository<Subcategory>,
    @Inject(StorageManager) private readonly storageManager: StorageManager,
    @Inject(ImageManager) private readonly imageManager: ImageManager,
  ) {
    super(subcategory_repo);
  }





  async createSubcategory(req: CreateCategoryRequest): Promise<Subcategory> {
    const subcategory = this._repo.create(plainToInstance(Subcategory, req));
    if (req.logo) {
      // resize image to 300x300
      const resizedImage = await this.imageManager.resize(req.logo, {
        size: { width: 300, height: 300 },
        options: {
          fit: sharp.fit.cover,
          position: sharp.strategy.entropy,
        },
      });

      // save image
      const path = await this.storageManager.store(
        { buffer: resizedImage, originalname: req.logo.originalname },
        { path: 'sub-category-logo' },
      );

      // set avatar path
      subcategory.logo = path;
    }
    await this._repo.save(subcategory);
    return subcategory;
  }


  
}
