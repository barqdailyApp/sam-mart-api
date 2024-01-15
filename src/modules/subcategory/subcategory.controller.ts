import { Body, ClassSerializerInterceptor, Controller, Delete, Get, Param, Post, Put, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
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
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { RolesGuard } from '../authentication/guards/roles.guard';
import { Roles } from '../authentication/guards/roles.decorator';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { UpdateCategoryRequest } from '../category/dto/requests/update-category-request';

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
      const total = await this.subcategoryService.count(query);
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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(ClassSerializerInterceptor, FileInterceptor('logo'))
  @ApiConsumes('multipart/form-data')
  @Put()
  async update(
    @Body() req: UpdateCategoryRequest,
    @UploadedFile(new UploadValidator().build())
    logo: Express.Multer.File,
  ) {
    req.logo = logo;
    return new ActionResponse(await this.subcategoryService.updateSubCategory(req));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete("/:sub_category_id")
  async delete(@Param('sub_category_id') id: string) {
    return new ActionResponse(await this.subcategoryService.deleteSubCategory(id));
  }
}
