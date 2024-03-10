import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass, plainToInstance } from 'class-transformer';
import * as sharp from 'sharp';
import { BaseService } from 'src/core/base/service/service.base';
import { Category } from 'src/infrastructure/entities/category/category.entity';
import { Subcategory } from 'src/infrastructure/entities/category/subcategory.entity';
import { ImageManager } from 'src/integration/sharp/image.manager';
import { Repository } from 'typeorm';
import { CreateCategoryRequest } from '../category/dto/requests/create-category-request';
import { StorageManager } from 'src/integration/storage/storage.manager';
import { MostHitSubcategory } from 'src/infrastructure/entities/category/most-hit-subcategory.entity';
import { CategorySubCategory } from 'src/infrastructure/entities/category/category-subcategory.entity';
import { PaginatedRequest } from 'src/core/base/requests/paginated.request';
import { Cron, CronExpression } from '@nestjs/schedule';
import { QueryHitsSubCategoryRequest } from './dto/request/query-hits-subcategory.request';
import { UpdateCategoryRequest } from '../category/dto/requests/update-category-request';
import { FileService } from '../file/file.service';
import { toUrl } from 'src/core/helpers/file.helper';
import { ImportCategoryRequest } from '../category/dto/requests/import-category-request';
import {
  CreateCategoriesExcelRequest,
  CreateCategoryExcelRequest,
} from '../category/dto/requests/create-categories-excel-request';
import { validate } from 'class-validator';

@Injectable()
export class SubcategoryService extends BaseService<Subcategory> {
  constructor(
    @InjectRepository(Subcategory)
    private readonly subcategory_repo: Repository<Subcategory>,
    @InjectRepository(MostHitSubcategory)
    private mostHitSubcategoryRepository: Repository<MostHitSubcategory>,
    @InjectRepository(CategorySubCategory)
    private categorySubCategoryRepository: Repository<CategorySubCategory>,
    @Inject(StorageManager) private readonly storageManager: StorageManager,
    @Inject(ImageManager) private readonly imageManager: ImageManager,
    @Inject(FileService) private _fileService: FileService,
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

  async updateMostHitSubCategory({
    sub_category_id,
    section_category_id,
  }: {
    sub_category_id?: string;
    section_category_id?: string;
  }) {
    const findCategorySubCategory =
      await this.categorySubCategoryRepository.find({
        where: [
          { subcategory_id: sub_category_id },
          { section_category_id: section_category_id },
        ],
      });

    for (const categorySubCategory of findCategorySubCategory) {
      const findMostHitSubCategory =
        await this.mostHitSubcategoryRepository.findOne({
          where: {
            category_sub_category_id: categorySubCategory.id,
          },
        });

      if (findMostHitSubCategory) {
        findMostHitSubCategory.current_hit += 1;
        await this.mostHitSubcategoryRepository.save(findMostHitSubCategory);
      } else {
        const newSubCategory = this.mostHitSubcategoryRepository.create({
          categorySubCategory,
          current_hit: 1,
        });
        await this.mostHitSubcategoryRepository.save(newSubCategory);
      }
    }
  }

  async getMostHitSubcategory(queryRequest: QueryHitsSubCategoryRequest) {
    let { page, limit, section_category_id, section_id } = queryRequest;

    page = page || 1;
    limit = limit || 10;

    const queryOptions: any = {
      where: {
        categorySubCategory: {
          section_category_id: section_category_id,
          section_category: {
            section_id: section_id,
          },
        },
      },
      relations: [
        'categorySubCategory',
        'categorySubCategory.subcategory',
        'categorySubCategory.section_category',
      ],
      order: { previous_hit: 'DESC', current_hit: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    };

    const mostHitSubCategories = await this.mostHitSubcategoryRepository.find(
      queryOptions,
    );
    const total_count = await this.mostHitSubcategoryRepository.count();
    return {
      mostHitSubCategories,
      total_count,
    };
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async flushMostHitSubcategory() {
    await this.mostHitSubcategoryRepository.update(
      {},
      { previous_hit: () => 'current_hit', current_hit: 0 },
    );
  }

  async updateSubCategory(req: UpdateCategoryRequest) {
    const subcategory = await this.subcategory_repo.findOne({
      where: { id: req.id },
    });

    if (!subcategory) {
      throw new NotFoundException('Subcategory not found');
    }

    if (req.logo) {
      await this._fileService.delete(subcategory.logo);
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

      subcategory.logo = path;
    }

    // Object.assign(subcategory, req);
    return await this.subcategory_repo.save(subcategory);
  }

  async deleteSubCategory(id: string) {
    const subcategory = await this._repo.findOne({ where: { id: id } });
    if (!subcategory) {
      throw new NotFoundException('Subcategory not found');
    }
    await this._fileService.delete(subcategory.logo);
    return await this.subcategory_repo.delete(id);
  }

  async exportSubCategory() {
    const subcategories = await this.categorySubCategoryRepository.find({
      relations: {
        subcategory: true,
        section_category: {
          section: true,
          category: true,
        },
      },
    });

    const flattenedData = subcategories.map((subcategory) => {
      const {
        id,
        subcategory_id,
        order_by,
        is_active,
        subcategory: {
          name_ar: subcategory_name_ar,
          name_en: subcategory_name_en,
          logo: subcategory_logo,
        },
        section_category: {
          section: {
            id: sectionId,
            name_ar: section_name_ar,
            name_en: section_name_en,
            logo: section_logo,
          },
          category: {
            id: categoryId,
            name_ar: category_name_ar,
            name_en: category_name_en,
            logo: category_logo,
          },
        },
      } = subcategory;

      return {
        id,
        subcategory_id,
        order_by,
        is_active,
        subcategory_name_ar,
        subcategory_name_en,
        subcategory_logo: toUrl(subcategory_logo),
        category_id: categoryId,
        category_name_ar,
        category_name_en,
        category_logo: toUrl(category_logo),
        section_id: sectionId,
        section_name_ar,
        section_name_en,
        section_logo: toUrl(section_logo),
      };
    });

    return await this._fileService.exportExcel(
      flattenedData,
      'subcategories',
      'subcategories',
    );
  }

  async importSubCategory(req: ImportCategoryRequest) {
    const file = await this.storageManager.store(req.file, {
      path: 'subcategory-export',
    });
    const jsonData = await this._fileService.importExcel(file);
    const subCategoriesRequest = plainToClass(CreateCategoriesExcelRequest, {
      categories: jsonData,
    });
    const validationErrors = await validate(subCategoriesRequest);

    if (validationErrors.length > 0) {
      throw new NotFoundException(JSON.stringify(validationErrors));
    }

    const newSubCategories = jsonData.map((subcategoryData) => {
      const { name_ar, name_en, logo } = plainToClass(
        CreateCategoryExcelRequest,
        subcategoryData,
      );
      return this._repo.create({
        name_ar,
        name_en,
        logo,
      });
    });

    return await this._repo.save(newSubCategories);
  }
}
