import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { RolesGuard } from '../authentication/guards/roles.guard';
import { PackageServicesService } from './package-services.service';
import { CreatePackageServicesRequest } from './dto/create-package-services.request';
import { PackagesServices } from 'src/infrastructure/entities/package/packages-services';
import { ActionResponse } from 'src/core/base/responses/action.response';
import { Package } from 'src/infrastructure/entities/package/package.entity';
import { PackageServiceResponse } from './dto/package-services.response';
import { ServiceResponse } from '../service/dto/service.response';
import { UpdatePackageServicesRequest } from './dto/update-package-services.request';
import { DeleteResult } from 'typeorm';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { Roles } from '../authentication/guards/roles.decorator';
@ApiBearerAuth()
@ApiHeader({
  name: 'Accept-Language',
  required: false,
  description: 'Language header: en, ar',
})
@ApiTags('package-services')
@Controller('package-services')
export class PackageServicesController {
  constructor(
    private readonly packageServicesService: PackageServicesService,
  ) {}
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('add-service-to-package')
  async addServiceToPackage(
    @Body() createPackageServicesRequest: CreatePackageServicesRequest,
  ) {
    const add_service_to_package =
      await this.packageServicesService.addServiceToPackage(
        createPackageServicesRequest,
      );

    return new ActionResponse<PackagesServices>(add_service_to_package);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Put('update-package-service')
  async updatePackageService(

    @Body() updatePackageServicesRequest: UpdatePackageServicesRequest,
  ) {
    const update_details_package_service =
      await this.packageServicesService.updateDetailsPackageService(
   
        updatePackageServicesRequest,
      );

    return new ActionResponse<Package>(update_details_package_service);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':package-id/:service-id/delete-package')
  async deletePackageService(
    @Param('package-id') package_id: string,
    @Param('service-id') service_id: string,
  ) {
    const delete_package =
      await this.packageServicesService.deletePackageService(
        package_id,
        service_id,
      );

    return new ActionResponse<DeleteResult>(delete_package);
  }
}
