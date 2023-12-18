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
import { ActionResponse } from 'src/core/base/responses/action.response';
import { DeleteResult } from 'typeorm';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { RolesGuard } from '../authentication/guards/roles.guard';
import { ServiceService } from './service.service';
import { CreateServiceRequest } from './dto/create-service.request';
import { Service } from 'src/infrastructure/entities/package/service.entity';
import { UpdateServiceRequest } from './dto/update-service.request';
import { plainToInstance } from 'class-transformer';
import { ServiceResponse } from './dto/service.response';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { Roles } from '../authentication/guards/roles.decorator';
import { I18nResponse } from 'src/core/helpers/i18n.helper';
@ApiBearerAuth()
@ApiHeader({
  name: 'Accept-Language',
  required: false,
  description: 'Language header: en, ar',
})
@ApiTags('Service')
@Controller('service')
export class ServiceController {
  constructor(
    private readonly serviceService: ServiceService,
    @Inject(I18nResponse) private readonly _i18nResponse: I18nResponse,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('create-service')
  async createService(@Body() createServiceRequest: CreateServiceRequest) {
    const create_service = await this.serviceService.createService(
      createServiceRequest,
    );
    const entity_to_dto = plainToInstance(ServiceResponse, create_service);
    const response = this._i18nResponse.entity(entity_to_dto);

    return new ActionResponse<ServiceResponse>(response);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Put('update-service')
  async updateService(@Body() updateServiceRequest: UpdateServiceRequest) {
    const update_service = await this.serviceService.updateService(
      updateServiceRequest,
    );

    const entity_to_dto = plainToInstance(ServiceResponse, update_service);
    const response = this._i18nResponse.entity(entity_to_dto);

    return new ActionResponse<ServiceResponse>(response);
  }

  @Get(':id/single-service')
  async getSingleService(@Param('id') id: string) {
    const update_service = await this.serviceService.getSingleService(id);

    return new ActionResponse<Service>(update_service);
  }
  @Get('all-service')
  async allServices() {
    const all_services = await this.serviceService.getAllServices();
    const services_dto: ServiceResponse[] = [];
    all_services.map((item) => {
      services_dto.push(plainToInstance(ServiceResponse, item));
    });
    const response = this._i18nResponse.entity(services_dto);

    return new ActionResponse<ServiceResponse[]>(response);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id/delete-service')
  async deleteService(@Param('id') id: string) {
    const delete_service = await this.serviceService.deleteService(id);

    return new ActionResponse<DeleteResult>(delete_service);
  }
}
