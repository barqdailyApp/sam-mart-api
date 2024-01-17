import { BadRequestException, Inject, Injectable, Put } from '@nestjs/common';
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
import { Cron, CronExpression } from '@nestjs/schedule';
import { UpdateCategoryRequest } from './dto/requests/update-category-request';
import { FileService } from '../file/file.service';
import { SubcategoryService } from '../subcategory/subcategory.service';
import { UpdateSectionCategoryRequest } from '../section/dto/requests/update-section-category.request';
import { ActionResponse } from 'src/core/base/responses/action.response';

@Injectable()
export class CategoryService extends BaseService<Category> {
  constructor(
    @InjectRepository(Category)
    private readonly category_repo: Repository<Category>,
    @InjectRepository(CategorySubCategory)
    private readonly category_subcategory_repo: Repository<CategorySubCategory>,
    @Inject(StorageManager) private readonly storageManager: StorageManager,
    @Inject(ImageManager) private readonly imageManager: ImageManager,
    @Inject(FileService) private _fileService: FileService,
    @Inject(SubcategoryService) private readonly subCategoryService: SubcategoryService,
  ) {
    super(category_repo);
  }

  async getCategorySubcategory(section_category_id: string) {
    await this.subCategoryService.updateMostHitSubCategory({ section_category_id });
    return await this.category_subcategory_repo.find({
      where: { section_category_id: section_category_id,is_active:true },
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
  async updateCategory(req: UpdateCategoryRequest): Promise<Category> {
    const category = await this._repo.findOne({ where: { id: req.id } });

    if (req.logo) {

      await this._fileService.delete(category.logo)
      // resize image to 300x300
      const logo = await this._fileService.upload(req.logo)


      // set avatar path
      category.logo = logo;
    }
    await this._repo.update(category.id, { ...plainToInstance(Category, req), logo: category.logo });
    return plainToInstance(Category, req);
  }
  async addSubcategoryToCategory(req: CategorySubcategoryRequest) {
    const category = await this.category_subcategory_repo.findOne({
      where: { section_category_id: req.section_category_id, subcategory_id: req.subcategory_id },
      relations: { subcategory: true },
    });

    if (category != null)
      throw new BadRequestException('subcategory already exist');

    return await this.category_subcategory_repo.save({
      ...req
    });
  }


  async updateCategorySubcategory(req:UpdateSectionCategoryRequest){
    return await this.category_subcategory_repo.update(req.id,req)

  }

  async deleteCategorySubcategory(id:string){
    return await this.category_subcategory_repo.delete(id)
  }
}

