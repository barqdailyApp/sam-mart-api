import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { I18nResponse } from 'src/core/helpers/i18n.helper';
import { ActionResponse } from 'src/core/base/responses/action.response';
import { SubcategoryResponse } from './dto/response/subcategory-response';
import { ApiBearerAuth, ApiConsumes, ApiHeader, ApiTags } from '@nestjs/swagger';
import { CreateCategoryRequest } from './dto/requests/create-category-request';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadValidator } from 'src/core/validators/upload.validator';
import { CreateSectionRequest } from '../section/dto/requests/create-section.request';
import { CategorySubcategoryRequest } from './dto/requests/create-category-subcategory-request';
import { PaginatedRequest } from 'src/core/base/requests/paginated.request';
import { PaginatedResponse } from 'src/core/base/responses/paginated.response';
import { plainToInstance } from 'class-transformer';
import { CategoryResponse } from './dto/response/category-response';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { Roles } from '../authentication/guards/roles.decorator';
import { RolesGuard } from '../authentication/guards/roles.guard';

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

  @ApiBearerAuth()

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)

  @Get()
  async getCategories(@Query() query: PaginatedRequest) {
    const categories = this._i18nResponse.entity(
      await this.categoryService.findAll(query),
    );
    const categoriesRespone=categories.map((e) => new CategoryResponse(e));

    if (query.page && query.limit) {
      const total = await this.categoryService.count(query);
      return new PaginatedResponse(categoriesRespone, {
        meta: { total, ...query },
      });
    } else {
      return new ActionResponse(categoriesRespone);
    }
  }

  @Get('/:section_category_id/subcategories')
  async getCAtegorySubcategory(@Param('section_category_id') id: string) {
    const subcategories = await this.categoryService.getCategorySubcategory(id);
    const data = this._i18nResponse.entity(subcategories);
    return new ActionResponse(
      data.map(
        (e) =>
          new SubcategoryResponse({
            ...e,
            logo: e.subcategory.logo,
            name: e.subcategory.name,
            sub_category_id: e.subcategory_id,
          }),
      ),
    );
  }

  @Post('/add-subcategory')
  async addSubcategoryToCategory(@Body() req: CategorySubcategoryRequest) {
    return new ActionResponse(
      await this.categoryService.addSubcategoryToCategory(req),
    );
  }

  @Get('/most-hit-subcategory')
  async getMostHitSubcategory(@Query() query: PaginatedRequest) {
    return new ActionResponse(
      await this.categoryService.getMostHitSubcategory(query),
    );
  }
}
