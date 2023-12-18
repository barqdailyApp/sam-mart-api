import { Controller, Get, Inject, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { PaginatedRequest } from 'src/core/base/requests/paginated.request';
import { ActionResponse } from 'src/core/base/responses/action.response';
import { PaginatedResponse } from 'src/core/base/responses/paginated.response';
import { toUrl } from 'src/core/helpers/file.helper';
import { I18nResponse } from 'src/core/helpers/i18n.helper';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { JwtAuthGuard } from 'src/modules/authentication/guards/jwt-auth.guard';
import { Roles } from 'src/modules/authentication/guards/roles.decorator';
import { RolesGuard } from 'src/modules/authentication/guards/roles.guard';
import { VehicleBrandResponse } from '../dto/responses/vehicle-brand.respone';
import { VehicleBrandService } from '../services/vehicle-brand.service';


@ApiTags('Vehicle Brands')
@ApiHeader({
  name: 'Accept-Language',
  required: false,
  description: 'Language header: en, ar',
})

@Controller('vehicle-brands')
export class VehicleBrandController {
  constructor(
    @Inject(VehicleBrandService) private readonly _service: VehicleBrandService,
    @Inject(I18nResponse) private readonly _i18nResponse: I18nResponse,
  ) { }
  @Get()

  async getAll(
    @Query() query?: PaginatedRequest,
  ): Promise<
    | PaginatedResponse<VehicleBrandResponse[]>
    | ActionResponse<VehicleBrandResponse[]>
  > {
    let result = await this._service.findAllActive(query);
    result = this._i18nResponse.entity(result);
    const response = plainToInstance(VehicleBrandResponse, result, {
      excludeExtraneousValues: true,
    });
    response.forEach((item) => item.logo = toUrl(item.logo, true)); // add full url to logo
    if (query.page && query.limit) {
      const total = await this._service.count();
      return new PaginatedResponse<VehicleBrandResponse[]>(response, {
        meta: { total, ...query },
      });
    } else {
      return new ActionResponse<VehicleBrandResponse[]>(response);
    }
  }
} 
