import { Body, Controller, Get, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { WarehouseService } from './warehouse.service';
import { WarehouseOperationRequest } from './dto/requests/warehouse-operation.request';
import { ApiBearerAuth, ApiTags, ApiHeader } from '@nestjs/swagger';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { RolesGuard } from '../authentication/guards/roles.guard';
import { CreateWarehouseRequest } from './dto/requests/create-warehouse.request';
import { plainToInstance } from 'class-transformer';
import { Warehouse } from 'src/infrastructure/entities/warehouse/warehouse.entity';
import { ActionResponse } from 'src/core/base/responses/action.response';
import { PaginatedRequest } from 'src/core/base/requests/paginated.request';
import { I18nResponse } from 'src/core/helpers/i18n.helper';
import { PaginatedResponse } from 'src/core/base/responses/paginated.response';
import { applyQueryIncludes } from 'src/core/helpers/service-related.helper';
import { Region } from 'src/infrastructure/entities/region/region.entity';
import { UpdateWarehouseRequest } from './dto/requests/update-warehouse.request';

@ApiBearerAuth()
@ApiTags('Warehouse')
@ApiHeader({
  name: 'Accept-Language',
  required: false,
  description: 'Language header: en, ar',
})
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('warehouse')
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService,
    private readonly _i18nResponse: I18nResponse,
  ) { }

  @Get()
  async get(@Query() query: PaginatedRequest) {
    applyQueryIncludes(query, "region");
    applyQueryIncludes(query, "region.city");
    applyQueryIncludes(query, "region.city.country");
    const warehouses = this._i18nResponse.entity(
      await this.warehouseService.findAll(query),
    );


    if (query.page && query.limit) {
      const total = await this.warehouseService.count(query);
      return new PaginatedResponse(warehouses, {
        meta: { total, ...query },
      });
    } else {
      return new ActionResponse(warehouses);
    }

  }

  @Post()
  async create(@Body() request: CreateWarehouseRequest) {
    return new ActionResponse(
      await this.warehouseService.create(plainToInstance(Warehouse, request)),
    );
  }

  @Post('operation')
  async createWarehouseOperation(@Body() request: WarehouseOperationRequest) {
    return new ActionResponse(
      await this.warehouseService.CreateWAarehouseOperation(request),
    );
  }

  @Patch("/:id")
  async update(
    @Body() request: UpdateWarehouseRequest,
    @Query("id") id: string
  ) {
    return new ActionResponse(
      await this.warehouseService.updateWarehouse(id, request),
    );
  }
}
