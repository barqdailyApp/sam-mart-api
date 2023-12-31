import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { I18nResponse } from 'src/core/helpers/i18n.helper';
import { ActionResponse } from 'src/core/base/responses/action.response';
import { SubcategoryResponse } from './dto/response/subcategory-response';
import { ApiConsumes, ApiHeader, ApiTags } from '@nestjs/swagger';
import { CreateCategoryRequest } from './dto/requests/create-category-request';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadValidator } from 'src/core/validators/upload.validator';
import { CreateSectionRequest } from '../section/dto/requests/create-section.request';

@ApiHeader({
  name: 'Accept-Language',
  required: false,
  description: 'Language header: en, ar',
})
@ApiTags('Category')
@Controller('category')
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly _i18nResponse: I18nResponse,
  ) {}

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
    return new ActionResponse(await this.categoryService.createCategory(req));
  }

  @Get('/:id/subcategories')
  async getCAtegorySubcategory(@Param('id') id: string) {
    const subcategories = await this.categoryService.getCategorySubcategory(id);
    const data = this._i18nResponse.entity(subcategories);
    return new ActionResponse(
      data.map(
        (e) =>
          new SubcategoryResponse({
            ...e,
            name: e.subcategory.name,
            sub_category_id: e.subcategory_id,
          }),
      ),
    );
  }
}
