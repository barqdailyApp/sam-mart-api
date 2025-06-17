import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Header,
  Inject,
  Param,
  Post,
  Put,
  Query,
  Res,
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
  ApiProperty,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { RolesGuard } from '../authentication/guards/roles.guard';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { plainToInstance } from 'class-transformer';
import { CategoryResponse } from '../category/dto/response/category-response';
import { Response, query } from 'express';
import { PaginatedRequest } from 'src/core/base/requests/paginated.request';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateSectionRequest } from './dto/requests/create-section.request';
import { UploadValidator } from 'src/core/validators/upload.validator';
import { applyQuerySort } from 'src/core/helpers/service-related.helper';
import { SectionCategoryRequest } from './dto/requests/create-section-category.request';
import { toUrl } from 'src/core/helpers/file.helper';
import { UpdateSectionRequest } from './dto/requests/update-section.request';
import { UpdateSectionCategoryRequest } from './dto/requests/update-section-category.request';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { Roles } from '../authentication/guards/roles.decorator';
import { ImportCategoryRequest } from '../category/dto/requests/import-category-request';
import { PaginatedResponse } from 'src/core/base/responses/paginated.response';
import { SectionResponse } from './dto/response/section.response';
import { CACHE_MANAGER, CacheInterceptor, CacheKey } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { DriverTypeEnum } from 'src/infrastructure/data/enums/driver-type.eum';
import { UpdateSystemScheduleRequest } from './dto/requests/update-system-schedule.request';
import { AddSyemtemScheduleRequest } from './dto/requests/create-system-schedule.request';

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
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  @Get('/system-schedule')
  async getSystemSchedule(@Query('type') type?:DriverTypeEnum) {
    const schedule = await this.sectionService.getSystemSchedule(type);
    return new ActionResponse(schedule);
    
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @Get('admin/system-schedule')
  async getAdminSystemSchedule(@Query('type') type:DriverTypeEnum) {
    const schedule = await this.sectionService.getSystemSchedule(type);
    return new ActionResponse(schedule);
    
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @Post('/system-schedule')
  async updateSystemSchedule(@Body() req: AddSyemtemScheduleRequest) {
    const schedule = await this.sectionService.createSystemSchedule(req);
    return new ActionResponse(schedule);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @Put('/system-schedule')
  async updateSystemScheduleById(@Body() req: UpdateSystemScheduleRequest) {
    const schedule = await this.sectionService.updateSystemSchedule(req);
    return new ActionResponse(schedule);
  }
  //delete system schedule
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @Delete('/system-schedule/:id')
  async deleteSystemSchedule(@Param('id') id: string) {
    this.cacheManager.reset();
    return new ActionResponse(await this.sectionService.deleteSystemSchedule(id));
  } 

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor, FileInterceptor('logo'))
  @ApiConsumes('multipart/form-data')
  @Post()
  async create(
    @Body() req: CreateSectionRequest,
    @UploadedFile(new UploadValidator().build())
    logo: Express.Multer.File,
  ) {
    this.cacheManager.reset();
    req.logo = logo;
    return new ActionResponse(await this.sectionService.createSection(req));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @Get('/export')
  @Header(
    'Content-type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  async exportSections(@Res() res: Response) {
    const File = await this.sectionService.exportSections();
    res.download(`${File}`);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor, FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @Post('/import')
  async importSections(
    @Body() req: ImportCategoryRequest,
    @UploadedFile(new UploadValidator().build())
    file: Express.Multer.File,
  ) {
    req.file = file;
    const jsonData = await this.sectionService.importSections(req);
    return new ActionResponse(jsonData);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @Get('/:id')
  async findSection(@Param('id') id: string) {
    const section = await this.sectionService.findOne(id);
    section.logo = toUrl(section.logo);
    return new ActionResponse(section);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor, FileInterceptor('logo'))
  @ApiConsumes('multipart/form-data')
  @Put()
  async update(
    @Body() req: UpdateSectionRequest,
    @UploadedFile(new UploadValidator().build())
    logo: Express.Multer.File,
  ) {
    this.cacheManager.reset();
    req.logo = logo;

    return new ActionResponse(await this.sectionService.updateSection(req));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @Delete('/:id')
  async deleteSection(@Param('id') id: string) {
    this.cacheManager.reset();
    return new ActionResponse(await this.sectionService.delete(id));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @Post('/add-category')
  async addCategoryToSection(@Body() req: SectionCategoryRequest) {
    this.cacheManager.reset();
    return new ActionResponse(
      await this.sectionService.addCategoryToSection(req),
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @Put('/section-category')
  async updateSectionCategory(@Body() req: UpdateSectionCategoryRequest) {
    this.cacheManager.reset();
    return new ActionResponse(
      await this.sectionService.updatSectionCategory(req),
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @Delete('/section-category/:id')
  async deleteSectionCategory(@Param('id') id: string) {
    this.cacheManager.reset();
    return new ActionResponse(
      await this.sectionService.deleteSectionCategory(id),
    );
  }

  @Get()
  // @CacheKey('sections')
  @ApiQuery({ name: 'user_id', type: String, required: false })
  async getSections(@Query('user_id') userId?: string) {
    const sections = (await this.sectionService.getSections(userId)).map(
      (e) => {
        e.logo = toUrl(e.logo);

        const data = plainToInstance(SectionResponse, {
          ...e,
          delivery_type_list: e.delivery_type,
        });
        return data;
      },
    );
    return new ActionResponse(sections);
  }

  @ApiProperty({ required: false })
  all?: boolean;
  @Get(':section_id/categories')
  async getSectionCategories(
    @Param('section_id') section_id: string,
    @Query('name') name = '',
    @Query('limit') limit = 100,
    @Query('page') page = 1,
    @Query('all') all?: boolean,
  ) {
    const categories = await this.sectionService.getSectionCategories(
      section_id,
      all,
      name,
      limit,
      page,
    );
    const data = this._i18nResponse.entity(categories);

    return new PaginatedResponse(
      data.section_categories[0].map(
        (e) =>
          new CategoryResponse({
            ...e,
            logo: e.category.logo,
            name: e.category.name,
            category_id: e.category_id,
          }),
      ),
      {
        meta: {
          total: data.section_categories[1] || 0,
          limit: limit,
          page: page,
        },
      },
    );
  }


}
