import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { SubcategoryService } from '../subcategory/subcategory.service';

@Module({
  providers: [CategoryService, SubcategoryService],
  controllers: [CategoryController]
})
export class CategoryModule { }
