import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { TermsConditionsService } from './terms-conditions.service';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { I18nResponse } from 'src/core/helpers/i18n.helper';
import { TermsConditions } from 'src/infrastructure/entities/terms-conditions/terms-conditions.entity';
import { ActionResponse } from 'src/core/base/responses/action.response';
import { UpdateTermsRequest } from './dto/update-terms.request';
import { DeleteResult } from 'typeorm';
import { CreateTermsRequest } from './dto/create-terms.request';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { Roles } from '../authentication/guards/roles.decorator';
import { RolesGuard } from '../authentication/guards/roles.guard';
@ApiBearerAuth()
@ApiHeader({
  name: 'Accept-Language',
  required: false,
  description: 'Language header: en, ar',
})
@ApiTags('Terms-conditions')
@Controller('terms-conditions')
export class TermsConditionsController {
  constructor(
    private readonly termsConditionsService: TermsConditionsService,
    @Inject(I18nResponse) private readonly _i18nResponse: I18nResponse,
  ) {}

  @Get()
  async getTermsConditions() {
    const termsConditionsData =
      await this.termsConditionsService.getTermsConditions();
    const data: TermsConditions[] =
      this._i18nResponse.entity(termsConditionsData);
    return new ActionResponse<TermsConditions[]>(data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('create-terms-conditions')
  async createTermsConditions(@Body() createTermsRequest: CreateTermsRequest) {
    const termsConditionsData =
      await this.termsConditionsService.createTermsConditions(
        createTermsRequest,
      );
    const data: TermsConditions =
      this._i18nResponse.entity(termsConditionsData);
    return new ActionResponse<TermsConditions>(data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Put(':id/update-terms-conditions')
  async updateTermsConditions(
    @Param('id') id: string,
    @Body() updateTermsRequest: UpdateTermsRequest,
  ) {
    const termsConditionsData =
      await this.termsConditionsService.UpdateTermsCondition(
        id,
        updateTermsRequest,
      );
    const data: TermsConditions =
      this._i18nResponse.entity(termsConditionsData);
    return new ActionResponse<TermsConditions>(data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id/terms-conditions')
  async deletePackage(@Param('id') id: string) {
    const delete_terms_conditions =
      await this.termsConditionsService.deleteTermCondition(id);

    return new ActionResponse<DeleteResult>(delete_terms_conditions);
  }
}
