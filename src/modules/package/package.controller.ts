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
import { PackageService } from './package.service';
import { CreatePackageRequest } from './dto/create-package.request';
import { ActionResponse } from 'src/core/base/responses/action.response';
import { Package } from 'src/infrastructure/entities/package/package.entity';
import { UpdatePackageRequest } from './dto/update-package.request';
import { DeleteResult, Repository } from 'typeorm';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { RolesGuard } from '../authentication/guards/roles.guard';
import {
  TransformPlainToInstance,
  classToPlain,
  plainToClass,
  plainToInstance,
} from 'class-transformer';
import { PackageResponse } from './dto/package.response';
import { PackageServiceResponse } from '../package-services/dto/package-services.response';
import { ServiceResponse } from '../service/dto/service.response';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { Roles } from '../authentication/guards/roles.decorator';
import { I18nResponse } from 'src/core/helpers/i18n.helper';
import { InjectRepository } from '@nestjs/typeorm';
import { AppConstants } from 'src/infrastructure/entities/app-constants/app-constants.entity';

@ApiBearerAuth()
@ApiHeader({
  name: 'Accept-Language',
  required: false,
  description: 'Language header: en, ar',
})
@ApiTags('Package')
@Controller('package')
export class PackageController {
  constructor(
    private readonly packageService: PackageService,
    @Inject(I18nResponse) private readonly _i18nResponse: I18nResponse,
    @InjectRepository(AppConstants)
    private app_constants: Repository<AppConstants>,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('create-package')
  async createPackage(@Body() createPackageRequest: CreatePackageRequest) {
    const create_package = await this.packageService.createPackage(
      createPackageRequest,
    );

    const entity_to_dto = plainToClass(PackageResponse, create_package, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    });
    const packageRes = new PackageResponse(entity_to_dto);
    //* Add Vat Rate in package
    const app_constants = await this.app_constants
      .createQueryBuilder('app-constants')
      .getOne();
    const vat = app_constants.tax_rate;
    packageRes.vat = vat;
    const data: PackageResponse = this._i18nResponse.entity(packageRes);
    return new ActionResponse<PackageResponse>(data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Put(':id/update-package')
  async updatePackage(
    @Param('id') id: string,
    @Body() updatePackageRequest: UpdatePackageRequest,
  ) {
    const update_package = await this.packageService.updatePackage(
      id,
      updatePackageRequest,
    );

    const entity_to_dto = plainToClass(PackageResponse, update_package, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    });
    const packageRes = new PackageResponse(entity_to_dto);
    //* Add Vat Rate in package
    const app_constants = await this.app_constants
      .createQueryBuilder('app-constants')
      .getOne();
    const vat = app_constants.tax_rate;
    packageRes.vat = vat;
    const data: PackageResponse = this._i18nResponse.entity(packageRes);
    return new ActionResponse<PackageResponse>(data);
  }

  @Get(':id/single-package')
  async getSinglePackage(@Param('id') id: string) {
    const package_current = await this.packageService.getSinglePackage(id);

    const package_service = package_current.package_service.map(
      (item) =>
        new PackageServiceResponse({
          id: item.id,
          package_id: item.package_id,
          service_count: item.service_count,
          is_active: item.is_active,
          total_service_price: item.total_price_service,
          service: new ServiceResponse(item.service),
        }),
    );

    const entity_to_dto = plainToInstance(PackageResponse, {
      ...package_current,
      package_service,
    });
    const packageRes = new PackageResponse(entity_to_dto);
    //* Add Vat Rate in package
    const app_constants = await this.app_constants
      .createQueryBuilder('app-constants')
      .getOne();
    const vat = app_constants.tax_rate;
    packageRes.vat = vat;
    const data: PackageResponse = this._i18nResponse.entity(packageRes);
    return new ActionResponse<PackageResponse>(data);
  }
  @Get('all-package')
  async allPackages() {
    const all_packages = await this.packageService.getAllPackages();
    const packages_dto: PackageResponse[] = [];

    all_packages.forEach(async (package_current) => {
      const package_service = package_current.package_service.map(
        (item) =>
          new PackageServiceResponse({
            id: item.id,
            package_id: item.package_id,
            service_count: item.service_count,
            is_active: item.is_active,
            total_service_price: item.total_price_service,
            service: new ServiceResponse(item.service),
          }),
      );

      const entity_to_dto = plainToInstance(PackageResponse, {
        ...package_current,
        package_service,
      });

      const packageRes = new PackageResponse(entity_to_dto);

      packages_dto.push(packageRes);
    });
    // //* Add Vat Rate in package
    const app_constants = await this.app_constants
      .createQueryBuilder('app-constants')
      .getOne();
    const vat = app_constants.tax_rate;

    for (let index = 0; index < packages_dto.length; index++) {
      packages_dto[index].vat = vat;
    }
    const data: PackageResponse[] = this._i18nResponse.entity(packages_dto);
    return new ActionResponse<PackageResponse[]>(data);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id/delete-package')
  async deletePackage(@Param('id') id: string) {
    const delete_package = await this.packageService.deletePackage(id);

    return new ActionResponse<DeleteResult>(delete_package);
  }
}
