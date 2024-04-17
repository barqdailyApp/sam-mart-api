import { BadRequestException, Inject, Injectable, Put } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  classToPlain,
  instanceToPlain,
  plainToClass,
  plainToInstance,
} from 'class-transformer';
import { json, where } from 'sequelize';
import * as sharp from 'sharp';
import { BaseService } from 'src/core/base/service/service.base';
import { CategorySubCategory } from 'src/infrastructure/entities/category/category-subcategory.entity';
import { Category } from 'src/infrastructure/entities/category/category.entity';
import { Section } from 'src/infrastructure/entities/section/section.entity';
import { ImageManager } from 'src/integration/sharp/image.manager';
import { Like, Repository, getConnection } from 'typeorm';
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
import { ImportCategoryRequest } from './dto/requests/import-category-request';
import { validate } from 'class-validator';
import {
  CreateCategoriesExcelRequest,
  CreateCategoryExcelRequest,
} from './dto/requests/create-categories-excel-request';
import { toUrl } from 'src/core/helpers/file.helper';
import { tr } from '@faker-js/faker';

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
    @Inject(SubcategoryService)
    private readonly subCategoryService: SubcategoryService, // @Inject(ImportExportService) private readonly importExportService: ImportExportService,
  ) {
    super(category_repo);
  }

  async getCategorySubcategory(
    section_category_id: string,
    all: boolean,
    name?: string,
  ) {
    await this.subCategoryService.updateMostHitSubCategory({
      section_category_id,
    });
    return await this.category_subcategory_repo.find({
      where: [
        {
          section_category_id: section_category_id,
          is_active: all == true ? null : true,
          subcategory: { name_ar: Like(`%${name}%`) },
        },
        {
          section_category_id: section_category_id,
          is_active: all == true ? null : true,
          subcategory: { name_en: Like(`%${name}%`) },
        },
      ],
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
      await this._fileService.delete(category.logo);
      // resize image to 300x300
      const logo = await this._fileService.upload(req.logo);

      // set avatar path
      category.logo = logo;
    }
    const result = await this._repo.update(category.id, {
      ...plainToInstance(Category, req),
      logo: category.logo,
    });
    return plainToInstance(Category, result);
  }
  async addSubcategoryToCategory(req: CategorySubcategoryRequest) {
    const category = await this.category_subcategory_repo.findOne({
      where: {
        section_category_id: req.section_category_id,
        subcategory_id: req.subcategory_id,
      },
      relations: { subcategory: true },
    });

    if (category != null)
      throw new BadRequestException('subcategory already exist');
    const result= await this.category_subcategory_repo.save({
      ...req,
    });
   await this.orderItems(req.section_category_id,true);
    return result;
   }

  async updateCategorySubcategory(req: UpdateSectionCategoryRequest) {
    const subcategory = await this.category_subcategory_repo.findOne({
      where: {
        id: req.id,
      },
    });
    if (!subcategory) throw new BadRequestException('subcategory not found');
    const result=await this.category_subcategory_repo.update(req.id, req);
  await  this.orderItems(subcategory.section_category_id,subcategory.order_by>req.order_by?false:true);
    return  result;
  }

  async deleteCategorySubcategory(id: string) {
    const subcategory = await this.category_subcategory_repo.findOne({
      where: {
        id: id,
      },
    });
    if (!subcategory) throw new BadRequestException('subcategory not found');
    this.orderItems(subcategory.section_category_id,true);
    return await this.category_subcategory_repo.softDelete(id);
  }

  async exportCategories() {
    const categories = await this._repo.find({
      relations: {
        section_categories: {
          section: true,
          category_subCategory: {
            subcategory: true,
          },
        },
      },
    });

    const flattenedData = [];

    categories.forEach((category) => {
      category.section_categories.forEach((section_category) => {
        section_category.category_subCategory.forEach(
          (category_subCategory) => {
            flattenedData.push({
              id: category.id,
              category_name_ar: category.name_ar,
              category_name_en: category.name_en,
              category_logo: toUrl(category.logo),
              is_active_category: section_category.is_active,
              section_id: section_category.section.id,
              section_name_ar: section_category.section.name_ar,
              section_name_en: section_category.section.name_en,
              section_logo: toUrl(section_category.section.logo),
              subcategory_id: category_subCategory.subcategory.id,
              is_active_subCategory: category_subCategory.is_active,
              subcategory_name_ar: category_subCategory.subcategory.name_ar,
              subcategory_name_en: category_subCategory.subcategory.name_en,
              subcategory_logo: toUrl(category_subCategory.subcategory.logo),
            });
          },
        );
      });
    });

    return await this._fileService.exportExcel(
      flattenedData,
      'categories',
      'categories',
    );
  }

  async importCategories(req: ImportCategoryRequest) {
    const file = await this.storageManager.store(req.file, {
      path: 'category-export',
    });
    const jsonData = await this._fileService.importExcel(file);
    const createCategoriesRequest = plainToClass(CreateCategoriesExcelRequest, {
      categories: jsonData,
    });
    const validationErrors = await validate(createCategoriesRequest);

    if (validationErrors.length > 0) {
      throw new BadRequestException(JSON.stringify(validationErrors));
    }

    const newCategories = jsonData.map((categoryData) => {
      const { name_ar, name_en, logo } = plainToClass(
        CreateCategoryExcelRequest,
        categoryData,
      );
      return this._repo.create({
        name_ar,
        name_en,
        logo,
      });
    });

    return await this._repo.save(newCategories);
  }

  async orderItems(section_category_id: string,asc:boolean) {
    try {
      const itemsToUpdate = await this.category_subcategory_repo.find({
        where: {
          section_category_id,
        },
        order: {
          order_by: 'ASC',
          updated_at:asc?'ASC':'DESC'
        
        },
      });

      let order = 1;
      for (const item of itemsToUpdate) {
        item.order_by = order++;
      }

      await this.category_subcategory_repo.save(itemsToUpdate);

    } catch (error) {
      console.error('Error occurred:', error.message);
    }
  }
}
