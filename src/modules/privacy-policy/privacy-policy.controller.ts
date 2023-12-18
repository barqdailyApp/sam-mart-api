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
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { I18nResponse } from 'src/core/helpers/i18n.helper';
import { TermsConditions } from 'src/infrastructure/entities/terms-conditions/terms-conditions.entity';
import { ActionResponse } from 'src/core/base/responses/action.response';
import { DeleteResult } from 'typeorm';
import { PrivacyPolicyService } from './privacy-policy.service';
import { PrivacyPolicy } from 'src/infrastructure/entities/privacy-policy/privacy-policy.entity';
import { UpdatePrivacyPolicyRequest } from './dto/update-privacy-policy.request';
import { CreatePrivacyPolicyRequest } from './dto/create-privacy-policy.request';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { Roles } from '../authentication/guards/roles.decorator';
import { RolesGuard } from '../authentication/guards/roles.guard';

@ApiHeader({
  name: 'Accept-Language',
  required: false,
  description: 'Language header: en, ar',
})
@ApiTags('Privacy-Policy')
@Controller('privacy-policy')
export class PrivacyPolicyController {
  constructor(
    private readonly privacyPolicyService: PrivacyPolicyService,
    @Inject(I18nResponse) private readonly _i18nResponse: I18nResponse,
  ) {}

  @Get()
  async getPrivacyPolicy() {
    const privacyPolicyData =
      await this.privacyPolicyService.getPrivacyPolicy();
    const data: PrivacyPolicy[] = this._i18nResponse.entity(privacyPolicyData);
    return new ActionResponse<PrivacyPolicy[]>(data);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('create-privacy-policy')
  async createPrivacyPolicy(
    @Body() createPrivacyPolicyRequest: CreatePrivacyPolicyRequest,
  ) {
    const PrivacyPolicyData =
      await this.privacyPolicyService.createTermsConditions(
        createPrivacyPolicyRequest,
      );
    const data: PrivacyPolicy = this._i18nResponse.entity(PrivacyPolicyData);
    return new ActionResponse<PrivacyPolicy>(data);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Put(':id/update-privacy-policy')
  async updateTermsConditions(
    @Param('id') id: string,
    @Body() updatePrivacyPolicyRequest: UpdatePrivacyPolicyRequest,
  ) {
    const privacyPolicyData =
      await this.privacyPolicyService.UpdatePrivacyPolicy(
        id,
        updatePrivacyPolicyRequest,
      );
    const data: TermsConditions = this._i18nResponse.entity(privacyPolicyData);
    return new ActionResponse<PrivacyPolicy>(data);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id/privacy-policy')
  async deletePrivacyPolicy(@Param('id') id: string) {
    const delete_privacy_policy =
      await this.privacyPolicyService.deletePrivacyPolicy(id);

    return new ActionResponse<DeleteResult>(delete_privacy_policy);
  }
}
