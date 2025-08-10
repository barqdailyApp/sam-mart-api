import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { RolesGuard } from '../authentication/guards/roles.guard';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { Roles } from '../authentication/guards/roles.decorator';
import { UpdateStaticPageRequest } from './dto/request/update-static-page.request';
import { StaticPageService } from './static-page.service';
import { StaticPagesEnum } from 'src/infrastructure/data/enums/static-pages.enum';
import { GetStaticPage } from './dto/request/get-static-page.request';
import { I18nResponse } from 'src/core/helpers/i18n.helper';
import { ActionResponse } from 'src/core/base/responses/action.response';
import { StaticPage } from 'src/infrastructure/entities/static-pages/static-pages.entity';
import { plainToInstance } from 'class-transformer';
import { StaticPageResponse } from './dto/response/static-page.response';
import { CacheInterceptor, CacheKey } from '@nestjs/cache-manager';

@ApiBearerAuth()
@ApiHeader({
  name: 'Accept-Language',
  required: false,
  description: 'Language header: en, ar',
})
@ApiTags('Satic Page')
@Controller('static-page')
export class StaticPageController {
  constructor(
    private readonly staticPageService: StaticPageService,
    private readonly _i18nResponse: I18nResponse,
  ) {}

  @Patch()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async updateStaticPage(
    @Body() req: UpdateStaticPageRequest,
  ): Promise<ActionResponse<StaticPage>> {
    const result = await this.staticPageService.updateStaticPageByType(req);
    return new ActionResponse<StaticPage>(result);
  }
 


  @Get('health')
  async health(){
    return true;
  }
  @Get('whats-app')

  async getWhatsAppStaticPage() {
    return new ActionResponse({ support: '+967734220888', shein: null });
  }

  @Get('/:static_page_type')

  async getStaticPage(
    @Param() param: GetStaticPage,
  ): Promise<ActionResponse<StaticPageResponse>> {
    let staticPage = await this.staticPageService.getStaticPageByType(
      param.static_page_type,
    );
    console.log(staticPage);
  
    staticPage = this._i18nResponse.entity(staticPage);

    const result = plainToInstance(StaticPageResponse, staticPage, {
      excludeExtraneousValues: true,
    });
    return new ActionResponse<StaticPageResponse>(result);
  }
}
