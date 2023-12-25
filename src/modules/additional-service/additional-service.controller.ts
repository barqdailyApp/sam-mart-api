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
  import { ApiTags } from '@nestjs/swagger';
import { AdditionalServiceService } from './additional-service.service';
import { AdditionalServiceResponse } from './dto/responses/additional-service.response';
import { CreateAdditionalServiceRequest } from './dto/requests/create-additional-service.request';
import { UpdateAdditionalServiceRequest } from './dto/requests/update-additional-service.request';
  
  
@ApiTags('Additional-Service')
@Controller('additional-service')
export class AdditionalServiceController {
    constructor(
        private readonly additionalServiceService: AdditionalServiceService,
        @Inject(I18nResponse) private readonly _i18nResponse: I18nResponse,
      ) {}
    
      @Get('all-additionalServices-units')
      async allAdditionalServices() {
        const additionalServices = await this.additionalServiceService.findAll();
        const additionalServicesResponse = additionalServices.map((additionalService) =>
          plainToClass(AdditionalServiceResponse, additionalService),
        );
        return new ActionResponse(
          this._i18nResponse.entity(additionalServicesResponse),
        );
      }
      @Get(':additional_service_id/additional-service-unit')
      async singleAdditionalService(@Param('additional_service_id') id: string) {
        const additionalService = await this.additionalServiceService.single(id);
        const additionalServiceResponse = plainToClass(
            AdditionalServiceResponse,
          additionalService,
        );
        return new ActionResponse(this._i18nResponse.entity(additionalServiceResponse));
      }
    
      @Post('create-additional-service-unit')
      async createAdditionalService(
        @Body() createAdditionalServiceRequest: CreateAdditionalServiceRequest,
      ) {
        return new ActionResponse(
          await this.additionalServiceService.create(createAdditionalServiceRequest),
        );
      }
    
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
    
      @Delete(':additional_service_id/delete-additional-service-unit')
      async deleteAdditionalService(@Param('additional_service_id') id: string) {
        return new ActionResponse(await this.additionalServiceService.delete(id));
      }
}
