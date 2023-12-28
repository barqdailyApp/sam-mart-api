import { Controller, Get, Inject, Param, Query, UseGuards } from '@nestjs/common';
import { I18nResponse } from 'src/core/helpers/i18n.helper';
import { SectionService } from './section.service';
import { ActionResponse } from 'src/core/base/responses/action.response';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../authentication/guards/roles.guard';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { plainToInstance } from 'class-transformer';
import { CategoryResponse } from '../category/dto/response/category-response';
import { query } from 'express';
import { PaginatedRequest } from 'src/core/base/requests/paginated.request';

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
  @Get()
  async getSections(@Query() query: PaginatedRequest) {
    return new ActionResponse(
      this._i18nResponse.entity(await this.sectionService.findAll(query)),
    );
  }

  @Get(':section_id/categories')
  async getSectionCategories(@Param('section_id') section_id: string) {
    const categories = await this.sectionService.getSectionCategories(section_id);
    const data = this._i18nResponse.entity(categories);
 
    return new ActionResponse(
     data.map((e)=>new CategoryResponse({...e,name:e.category.name,category_id:e.category_id,},)),
      
        
      
    );
  }
}
