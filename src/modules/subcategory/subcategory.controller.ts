import { Body, ClassSerializerInterceptor, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiHeader, ApiTags } from '@nestjs/swagger';
import { ActionResponse } from 'src/core/base/responses/action.response';
import { UploadValidator } from 'src/core/validators/upload.validator';
import { CreateCategoryRequest } from '../category/dto/requests/create-category-request';
import { Subcategory } from 'src/infrastructure/entities/category/subcategory.entity';
import { SubcategoryService } from './subcategory.service';

@ApiHeader({
    name: 'Accept-Language',
    required: false,
    description: 'Language header: en, ar',
  })
  @ApiTags('Subcategory')
@Controller('subcategory')
export class SubcategoryController {
constructor(private readonly subcategory:SubcategoryService){}

    @UseInterceptors(ClassSerializerInterceptor, FileInterceptor('logo'))
    @ApiConsumes('multipart/form-data')
    @Post()
    async create(
      @Body() req: CreateCategoryRequest,
      @UploadedFile(new UploadValidator().build())
      logo: Express.Multer.File,
    ) {
      console.log(req);
      req.logo = logo;
      return new ActionResponse(await this.subcategory.createSubcategory(req));
    }
}
