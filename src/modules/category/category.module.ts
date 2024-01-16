import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { SubcategoryService } from '../subcategory/subcategory.service';
import { ImportExportService } from '../import-export/import-export.service';

@Module({
  providers: [CategoryService, SubcategoryService, ImportExportService],
  controllers: [CategoryController]
})
export class CategoryModule { }
