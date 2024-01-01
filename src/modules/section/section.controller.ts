import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { I18nResponse } from 'src/core/helpers/i18n.helper';
import { SectionService } from './section.service';
import { ActionResponse } from 'src/core/base/responses/action.response';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiHeader,
  ApiTags,
} from '@nestjs/swagger';
import { RolesGuard } from '../authentication/guards/roles.guard';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { plainToInstance } from 'class-transformer';
import { CategoryResponse } from '../category/dto/response/category-response';
import { query } from 'express';
import { PaginatedRequest } from 'src/core/base/requests/paginated.request';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateSectionRequest } from './dto/requests/create-section.request';
import { UploadValidator } from 'src/core/validators/upload.validator';
import { applyQuerySort } from 'src/core/helpers/service-related.helper';
import { SectionCategoryRequest } from './dto/requests/create-section-category.request';
import { toUrl } from 'src/core/helpers/file.helper';

@ApiHeader({
  name: 'Accept-Language',
  required: false,
  description: 'Language header: en, ar',
})
@ApiTags('Section')
@Controller('section')
export class SectionController {
  constructor(
    private readonly sectionService: SectionService,
    @Inject(I18nResponse) private readonly _i18nResponse: I18nResponse,
  ) {}

  @UseInterceptors(ClassSerializerInterceptor, FileInterceptor('logo'))
  @ApiConsumes('multipart/form-data')
  @Post()
  async create(
    @Body() req: CreateSectionRequest,
    @UploadedFile(new UploadValidator().build())
    logo: Express.Multer.File,
  ) {
    console.log(req);
    req.logo = logo;
    return new ActionResponse(await this.sectionService.createSection(req));
  }

  @Post('/category')
  async addCategoryToSection(@Body() req: SectionCategoryRequest) {
    return new ActionResponse(
      await this.sectionService.addCategoryToSection(req),
    );
  }

  @Get()
  async getSections(@Query() query: PaginatedRequest) {
    applyQuerySort(query, 'order_by=ASC');
    return new ActionResponse(
      this._i18nResponse.entity(
        (await this.sectionService.findAll(query)).map((e) => {
          e.logo = toUrl(e.logo);
          return e;
        }),
      ),
    );
  }

  @Get(':section_id/categories')
  async getSectionCategories(@Param('section_id') section_id: string) {
    const categories = await this.sectionService.getSectionCategories(
      section_id,
    );
    const data = this._i18nResponse.entity(categories);

    return new ActionResponse(
      data.map(
        (e) =>
          new CategoryResponse({
            ...e,
            name: e.category.name,
            category_id: e.category_id,
          }),
      ),
    );
  }
}
