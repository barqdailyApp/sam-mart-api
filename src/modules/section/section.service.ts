import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Section } from 'src/infrastructure/entities/section/section.entity';
import { Any, In, Like, Repository } from 'typeorm';
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
import { CreateSectionExcelRequest, CreateSectionsExcelRequest } from './dto/requests/create-sections-excel.request';
import { validate } from 'class-validator';

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
      order: { order_by: 'ASC' },
    });

    if (!user)
      return sections.filter((section) =>
        section.allowed_roles.includes(Role.CLIENT),
      );
    if (user.roles.includes(Role.ADMIN)) return sections
    return sections.filter((section) => {
      return user.roles.includes(section.allowed_roles[0]);
    });
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
    await this._repo.update(section.id, {
      ...plainToInstance(Section, req),
      logo: section.logo,
    });
    return plainToInstance(Section, req);
  }

  async getSectionCategories(section_id: string): Promise<SectionCategory[]> {
    return await this.section_category_repo.find({
      where: { section_id, is_active: true },
      relations: { category: true },
      order: { order_by: 'ASC' },
    });
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
    return await this.section_category_repo.save({
      ...req,
    });
  }

  async updatSectionCategory(req: UpdateSectionCategoryRequest) {
    return await this.section_category_repo.update(req.id, req);
  }

  async deleteSectionCategory(id: string) {
    return await this.section_category_repo.delete(id);
  }

  async exportSections() {
    const sections = await this._repo.find({
      relations: {
        section_categories: {
          category: true,
        },
      },
    });

    const flattenedData = [];
    sections.forEach((section) => {
      section.section_categories.forEach((category) => {
        flattenedData.push({
          section_name_ar: section.name_ar,
          section_name_en: section.name_en,
          section_logo: toUrl(section.logo),
          section_is_active: section.is_active,
          section_order_by: section.order_by,
          section_min_order_price: section.min_order_price,
          section_delivery_type: section.delivery_type,
          section_delivery_price: section.delivery_price,
          section_allowed_roles: section.allowed_roles,
          category_name_ar: category.category.name_ar,
          category_name_en: category.category.name_en,
          category_logo: toUrl(category.category.logo),
        });
      });
    });

    return this._fileService.exportExcel(flattenedData, 'sections', 'sections');
  }

  async importSections(req: any) {
    const file = await this.storageManager.store(req.file, { path: 'category-export' });
    const jsonData = await this._fileService.importExcel(file);
    const CreateSectionRequest = plainToClass(CreateSectionsExcelRequest, { sections: jsonData });
    const validationErrors = await validate(CreateSectionRequest);
    if (validationErrors.length > 0) {
      throw new BadRequestException(JSON.stringify(validationErrors));
    }

    const newSections = jsonData.map((sectionData) => {
      const {
        name_ar,
        name_en,
        order_by,
        min_order_price,
        allowed_roles,
        delivery_price,
        delivery_type,
        is_active,
        logo,
      } = plainToClass(CreateSectionExcelRequest, sectionData)

      return this._repo.create({
        name_ar,
        name_en,
        order_by,
        min_order_price,
        allowed_roles,
        delivery_price,
        delivery_type,
        is_active,
        logo
      });
    })

    return await this._repo.save(newSections);
  }
}
