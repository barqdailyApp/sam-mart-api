import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { where } from 'sequelize';
import * as sharp from 'sharp';
import { BaseService } from 'src/core/base/service/service.base';
import { CategorySubCategory } from 'src/infrastructure/entities/category/category-subcategory.entity';
import { Category } from 'src/infrastructure/entities/category/category.entity';
import { Section } from 'src/infrastructure/entities/section/section.entity';
import { ImageManager } from 'src/integration/sharp/image.manager';
import { Repository } from 'typeorm';
import { CreateSectionRequest } from '../section/dto/requests/create-section.request';
import { StorageManager } from 'src/integration/storage/storage.manager';
import { CreateCategoryRequest } from './dto/requests/create-category-request';
import { CategorySubcategoryRequest } from './dto/requests/create-category-subcategory-request';
import { Subcategory } from 'src/infrastructure/entities/category/subcategory.entity';
import { MostHitSubcategory } from 'src/infrastructure/entities/category/most-hit-subcategory.entity';
import { PaginatedRequest } from 'src/core/base/requests/paginated.request';

@Injectable()
export class CategoryService extends BaseService<Category> {
  constructor(
    @InjectRepository(Category)
    private readonly category_repo: Repository<Category>,
    @InjectRepository(Subcategory)
    private readonly subcategory_repo: Repository<Subcategory>,
    @InjectRepository(CategorySubCategory)
    private readonly category_subcategory_repo: Repository<CategorySubCategory>,
    @InjectRepository(MostHitSubcategory)
    private readonly mostHitSubcategory_repo: Repository<MostHitSubcategory>,
    @Inject(StorageManager) private readonly storageManager: StorageManager,
    @Inject(ImageManager) private readonly imageManager: ImageManager,
  ) {
    super(category_repo);
  }

  async getCategorySubcategory(category_id: string) {
    return await this.category_subcategory_repo.find({
      where: { category_id: category_id },
      relations: { subcategory: true },
      order: { order_by: 'ASC' },
    });
  }

  async createCategory(req: CreateCategoryRequest): Promise<Category> {
    const category = this._repo.create(plainToInstance(Category, req));
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
        { path: 'category-logo' },
      );

      // set avatar path
      category.logo = path;
    }
    await this._repo.save(category);
    return category;
  }
  async addSubcategoryToCategory(req: CategorySubcategoryRequest) {
    const category = await this.category_repo.findOne({
      where: { id: req.category_id },
      relations: { category_subCategory: true },
    });
    if (category.category_subCategory.find((e) => e.subcategory_id === req.subcategory_id)) {
      throw new BadRequestException('subcategory already exist');
    }
    return await this.category_subcategory_repo.save({
      ...req
    });
  }

  async getMostHitSubcategory(paginatedRequest: PaginatedRequest) {
    let { page, limit, select } = paginatedRequest;

    page = page || 1;
    limit = limit || 10;

    const queryOptions: any = {
      relations: { subcategory: true },
      order: { previous_hit: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    };

    if (select) {
      queryOptions.select = select;
    }

    return await this.mostHitSubcategory_repo.find(queryOptions);
  }
}
