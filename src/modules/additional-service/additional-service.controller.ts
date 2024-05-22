import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { I18nResponse } from 'src/core/helpers/i18n.helper';
import { ActionResponse } from 'src/core/base/responses/action.response';
import { plainToClass } from 'class-transformer';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { AdditionalServiceService } from './additional-service.service';
import { AdditionalServiceResponse } from './dto/responses/additional-service.response';
import { CreateAdditionalServiceRequest } from './dto/requests/create-additional-service.request';
import { UpdateAdditionalServiceRequest } from './dto/requests/update-additional-service.request';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { Roles } from '../authentication/guards/roles.decorator';

@ApiBearerAuth()
@ApiHeader({
  name: 'Accept-Language',
  required: false,
  description: 'Language header: en, ar',
})
@ApiTags('Additional-Service')
@Controller('additional-service')
export class AdditionalServiceController {
  constructor(
    private readonly additionalServiceService: AdditionalServiceService,
    @Inject(I18nResponse) private readonly _i18nResponse: I18nResponse,
  ) {}

  @Roles(Role.ADMIN)
  @Get('all-additionalServices-units')
  async allAdditionalServices() {
    const additionalServices = await this.additionalServiceService.findAll();
    const additionalServicesResponse = additionalServices.map(
      (additionalService) =>
        plainToClass(AdditionalServiceResponse, additionalService),
    );
    const dataTranslation = this._i18nResponse.entity(
      additionalServicesResponse,
    );
    return new ActionResponse(additionalServicesResponse);
  }
  @Get(':additional_service_id/additional-service-unit')
  async singleAdditionalService(@Param('additional_service_id') id: string) {
    const additionalService = await this.additionalServiceService.single(id);
    const additionalServiceResponse = plainToClass(
      AdditionalServiceResponse,
      additionalService,
    );
    const dataTranslation = this._i18nResponse.entity(
      additionalServiceResponse,
    );
    return new ActionResponse(additionalServiceResponse);
  }
  @Roles(Role.ADMIN)

  @Post('create-additional-service-unit')
  async createAdditionalService(
    @Body() createAdditionalServiceRequest: CreateAdditionalServiceRequest,
  ) {
    return new ActionResponse(
      await this.additionalServiceService.create(
        createAdditionalServiceRequest,
      ),
    );
  }
  @Roles(Role.ADMIN)
  @Put(':additional_service_id/update-additional-service-unit')
  async updateAdditionalService(
    @Param('additional_service_id') id: string,
    @Body() updateAdditionalServiceRequest: UpdateAdditionalServiceRequest,
  ) {
    return new ActionResponse(
      await this.additionalServiceService.update(
        id,
        updateAdditionalServiceRequest,
      ),
    );
  }
  @Roles(Role.ADMIN)

  @Delete(':additional_service_id/delete-additional-service-unit')
  async deleteAdditionalService(@Param('additional_service_id') id: string) {
    return new ActionResponse(await this.additionalServiceService.delete(id));
  }
}
