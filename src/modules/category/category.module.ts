import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { SubcategoryService } from '../subcategory/subcategory.service';
import { FileService } from '../file/file.service';

@Module({
  providers: [CategoryService, SubcategoryService, FileService],
  controllers: [CategoryController],
})
export class CategoryModule { }
