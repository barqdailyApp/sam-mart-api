import { Controller, Get, Param } from '@nestjs/common';
import { CategoryService } from './category.service';
import { I18nResponse } from 'src/core/helpers/i18n.helper';
import { ActionResponse } from 'src/core/base/responses/action.response';
import { SubcategoryResponse } from './dto/response/subcategory-response';
import { ApiHeader, ApiTags } from '@nestjs/swagger';

@ApiHeader({
    name: 'Accept-Language',
    required: false,
    description: 'Language header: en, ar',
  })
  @ApiTags('Category')
@Controller('category')
export class CategoryController {
  constructor(
    private readonly CategoryService: CategoryService,
    private readonly _i18nResponse: I18nResponse,
  ) {}

  @Get('/:id/subcategories')
  async getCAtegorySubcategory(@Param('id') id: string) {
    const subcategories = await this.CategoryService.getCategorySubcategory(
      id,    
    )
    const data=this._i18nResponse.entity(subcategories)
    return new ActionResponse(
    
      data.map((e)=>new SubcategoryResponse({...e,name:e.subcategory.name,sub_category_id:e.subcategory_id,},)),)
  }
}
