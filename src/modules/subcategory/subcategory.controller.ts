import { Body, ClassSerializerInterceptor, Controller, Get, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiHeader, ApiTags } from '@nestjs/swagger';
import { ActionResponse } from 'src/core/base/responses/action.response';
import { UploadValidator } from 'src/core/validators/upload.validator';
import { CreateCategoryRequest } from '../category/dto/requests/create-category-request';
import { Subcategory } from 'src/infrastructure/entities/category/subcategory.entity';
import { SubcategoryService } from './subcategory.service';
import { CategoryResponse } from '../category/dto/response/category-response';
import { PaginatedResponse } from 'src/core/base/responses/paginated.response';
import { PaginatedRequest } from 'src/core/base/requests/paginated.request';
import { I18nResponse } from 'src/core/helpers/i18n.helper';
import { QueryHitsSubCategoryRequest } from './dto/request/query-hits-subcategory.request';

@ApiHeader({
  name: 'Accept-Language',
  required: false,
  description: 'Language header: en, ar',
})
@ApiTags('Subcategory')
@Controller('subcategory')
export class SubcategoryController {
  constructor(private readonly subcategoryService: SubcategoryService,
    private readonly _i18nResponse: I18nResponse,) { }

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
    return new ActionResponse(await this.subcategoryService.createSubcategory(req));
  }

  @Get()
  async getCategories(@Query() query: PaginatedRequest) {
    const categories = this._i18nResponse.entity(
      await this.subcategoryService.findAll(query),
    );
    const categoriesRespone = categories.map((e) => new CategoryResponse(e));

    if (query.page && query.limit) {
      const total = await this.subcategoryService.count();
      return new PaginatedResponse(categoriesRespone, {
        meta: { total, ...query },
      });
    } else {
      return new ActionResponse(categoriesRespone);
    }
  }

  @Get('/most-hit-subcategory')
  async getMostHitSubcategory(@Query() query: QueryHitsSubCategoryRequest) {
    return new ActionResponse(
      await this.subcategoryService.getMostHitSubcategory(query),
    );
  }
}
