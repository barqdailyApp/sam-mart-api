import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Section } from 'src/infrastructure/entities/section/section.entity';
import { Any, In, Like, Repository, getConnection } from 'typeorm';
import { Request } from 'express';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { User } from 'src/infrastructure/entities/user/user.entity';
import { SectionCategory } from 'src/infrastructure/entities/section/section-category.entity';
import { BaseService } from 'src/core/base/service/service.base';
import { CreateSectionRequest } from './dto/requests/create-section.request';
import { ImageManager } from 'src/integration/sharp/image.manager';
import * as sharp from 'sharp';
import { StorageManager } from 'src/integration/storage/storage.manager';
import { plainToClass, plainToInstance } from 'class-transformer';
import { SectionCategoryRequest } from './dto/requests/create-section-category.request';
import { UpdateSectionRequest } from './dto/requests/update-section.request';
import { FileService } from '../file/file.service';
import { UpdateSectionCategoryRequest } from './dto/requests/update-section-category.request';
import { toUrl } from 'src/core/helpers/file.helper';
import {
  CreateSectionExcelRequest,
  CreateSectionsExcelRequest,
} from './dto/requests/create-sections-excel.request';
import { validate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { I18nResponse } from 'src/core/helpers/i18n.helper';
import { or } from 'sequelize';
import { fa } from '@faker-js/faker';

@Injectable()
export class SectionService extends BaseService<Section> {
  constructor(
    @InjectRepository(Section)
    private readonly section_repo: Repository<Section>,
    @InjectRepository(User) private readonly user_repo: Repository<User>,
    @InjectRepository(SectionCategory)
    private readonly section_category_repo: Repository<SectionCategory>,
    @Inject(StorageManager) private readonly storageManager: StorageManager,
    @Inject(ImageManager) private readonly imageManager: ImageManager,
    @Inject(FileService) private _fileService: FileService,
    @Inject(I18nResponse) private readonly _i18nResponse: I18nResponse,

    @Inject(REQUEST) readonly request: Request,
  ) {
    super(section_repo);
  }

  async getSections(user_id: string): Promise<Section[]> {
    const user =
      user_id == null
        ? null
        : await this.user_repo.findOne({ where: { id: user_id } });
    const sections = await this.section_repo.find({
      where: { is_active: true },
      order: { order_by: 'ASC' },
    });

    if (!user)
      return this._i18nResponse.entity(
        sections.filter((section) =>
          section.allowed_roles.includes(Role.CLIENT),
        ),
      );
    if (user.roles.includes(Role.ADMIN))
      return await this.section_repo.find({ order: { order_by: 'ASC' } });

    return this._i18nResponse.entity(
      sections.filter((section) => {
        return user.roles.includes(section.allowed_roles[0]);
      }),
    );
  }

  async createSection(req: CreateSectionRequest): Promise<Section> {
    const section = this._repo.create(plainToInstance(Section, req));
    if (req.logo) {
      const logo = await this._fileService.upload(req.logo);

      // set avatar path
      section.logo = logo;
    }

    await this._repo.save(section);
    return section;
  }

  async updateSection(req: UpdateSectionRequest): Promise<Section> {
    const section = await this._repo.findOne({ where: { id: req.id } });

    if (req.logo) {
      await this._fileService.delete(section.logo);
      // resize image to 300x300
      const logo = await this._fileService.upload(req.logo);

      // set avatar path
      section.logo = logo;
    }
    const result = await this._repo.update(section.id, {
      ...plainToInstance(Section, req),
      logo: section.logo,
    });
    return plainToInstance(Section, result);
  }

  async getSectionCategories(
    section_id: string,
    all: boolean,
    name: string,
    limit?: number,
    page?: number,
  ) {
    const section_categories = await this.section_category_repo.findAndCount({
      where: [
        {
          section_id,
          is_active: all == true ? null : true,
          category: { name_en: Like(`%${name}%`) },
        },
        {
          section_id,
          is_active: all == true ? null : true,
          category: { name_ar: Like(`%${name}%`) },
        },
      ],
      relations: { category: true },
      skip: limit * (page - 1),
      take: limit,
      order: { order_by: 'ASC' },
    });

    return { section_categories, page, limit };
  }

  async addCategoryToSection(req: SectionCategoryRequest) {
    const section = await this.section_repo.findOne({
      where: { id: req.section_id },
      relations: { section_categories: true },
    });
    if (
      section.section_categories.find((e) => e.category_id === req.category_id)
    ) {
      throw new BadRequestException('category already exist');
    }
    const result = await this.section_category_repo.save({
      ...req,
    });
    await this.orderItems(req.section_id,true);
    return result;
  }

  async updatSectionCategory(req: UpdateSectionCategoryRequest) {
    const section_category = await this.section_category_repo.findOne({
      where: { id: req.id },
    });
    if (!section_category) {
      throw new BadRequestException('category not found');
    }
    const result = await this.section_category_repo.update(req.id, req);
    await this.orderItems(section_category.section_id,section_category.order_by>req.order_by?false:true);
    return result;
  }

  async deleteSectionCategory(id: string) {
    const section_category = await this.section_category_repo.findOne({
      where: { id: id },relations:{category_subCategory:true}
    });
    if (!section_category) {
      throw new BadRequestException('category not found');
    }
    if(section_category.category_subCategory.length>0) throw new BadRequestException('message.category_has_subcategories');
    this.orderItems(section_category.section_id,true);
    return await this.section_category_repo.softDelete(id);
  }

  async exportSections() {
    const sections = await this._repo.find({});

    const flattenedData = [];
    sections.forEach((section) => {
      flattenedData.push({
        id: section.id,
        name_ar: section.name_ar,
        name_en: section.name_en,
        logo: toUrl(section?.logo),
        is_active: section.is_active,
        order_by: section.order_by,
        min_order_price: section.min_order_price,
        delivery_type: section.delivery_type,
        delivery_price: section.delivery_price,
        allowed_roles: section.allowed_roles,
      });
    });

    return await this._fileService.exportExcel(
      flattenedData,
      'sections',
      'sections',
    );
  }

  async importSections(req: any) {
    const file = await this.storageManager.store(req.file, {
      path: 'category-export',
    });
    const jsonData = await this._fileService.importExcel(file);
    const CreateSectionRequest = plainToClass(CreateSectionsExcelRequest, {
      sections: jsonData,
    });
    const validationErrors = await validate(CreateSectionRequest);
    if (validationErrors.length > 0) {
      throw new BadRequestException(JSON.stringify(validationErrors));
    }

    const newSections = jsonData.map(async (sectionData) => {
      const importedSection = plainToClass(
        CreateSectionExcelRequest,
        sectionData,
      );

      if (importedSection.id) {
        const existingSection = await this._repo.findOne({
          where: { id: importedSection.id },
        });
        if (!existingSection) {
          throw new BadRequestException('Section not found');
        }

        if (existingSection) {
          Object.assign(existingSection, importedSection);
          await this._repo.save(existingSection);
        }
      } else {
        const savedSection = await this._repo.create(importedSection);
        await this._repo.save(savedSection);
      }
    });

    await Promise.all(newSections);
  }

  async orderItems(section_id: string,asc:boolean ) {
    try {
      const itemsToUpdate = await this.section_category_repo.find({
        where: {
          section_id,
        },
        order: {
          order_by: 'ASC',
          updated_at :asc?'ASC':'DESC'
        },
      });

      let order = 1;
      for (const item of itemsToUpdate) {
        item.order_by = order++;
      }

      await this.section_category_repo.save(itemsToUpdate);

    } catch (error) {
      console.error('Error occurred:', error.message);
    }
  }
}
