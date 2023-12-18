import { Controller, Get, Inject, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { PaginatedRequest } from 'src/core/base/requests/paginated.request';
import { ActionResponse } from 'src/core/base/responses/action.response';
import { PaginatedResponse } from 'src/core/base/responses/paginated.response';
import { I18nResponse } from 'src/core/helpers/i18n.helper';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { JwtAuthGuard } from 'src/modules/authentication/guards/jwt-auth.guard';
import { Roles } from 'src/modules/authentication/guards/roles.decorator';
import { RolesGuard } from 'src/modules/authentication/guards/roles.guard';
import { VehicleBrandModelResponse } from '../dto/responses/vehicle-brand-model.respone';
import { VehicleBrandModelService } from '../services/vehicle-brand-model.service';


@ApiTags('Vehicle Brand Models')
@ApiHeader({
  name: 'Accept-Language',
  required: false,
  description: 'Language header: en, ar',
})

@Controller('vehicle-brand-models')
export class VehicleBrandModelController {
  constructor(
    @Inject(VehicleBrandModelService)
    private readonly _service: VehicleBrandModelService,
    @Inject(I18nResponse) private readonly _i18nResponse: I18nResponse,
  ) { }
  @Get()
 
  async getAllActive(
    @Query() query?: PaginatedRequest,
  ): Promise<
    | PaginatedResponse<VehicleBrandModelResponse[]>
    | ActionResponse<VehicleBrandModelResponse[]>
  > {
    let result = await this._service.findAllActive(query);
    result = this._i18nResponse.entity(result);
    const response = plainToInstance(VehicleBrandModelResponse, result, {
      excludeExtraneousValues: true,
    });
    if (query.page && query.limit) {
      const total = await this._service.count();
      return new PaginatedResponse<VehicleBrandModelResponse[]>(response, {
        meta: { total, ...query },
      });
    } else {
      return new ActionResponse<VehicleBrandModelResponse[]>(response);
    }
  }
}
