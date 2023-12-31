import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { where } from 'sequelize';
import { BaseService } from 'src/core/base/service/service.base';
import { CategorySubCategory } from 'src/infrastructure/entities/category/category-subcategory.entity';
import { Category } from 'src/infrastructure/entities/category/category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CategoryService extends BaseService<Category> {
  constructor(
    @InjectRepository(Category)
    private readonly category_repo: Repository<Category>,
    @InjectRepository(CategorySubCategory)
    private readonly category_subcategory_repo: Repository<CategorySubCategory>,
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
}
