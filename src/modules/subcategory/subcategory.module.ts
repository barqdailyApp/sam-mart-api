import { Module } from '@nestjs/common';
import { SubcategoryController } from './subcategory.controller';
import { SubcategoryService } from './subcategory.service';
import { FileService } from '../file/file.service';

@Module({
  providers: [SubcategoryService, FileService],
  controllers: [SubcategoryController],
  imports: [],
})
export class SubcategoryModule { }
