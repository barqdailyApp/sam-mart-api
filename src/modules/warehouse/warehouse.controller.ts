import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
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
import { WarehouseTransferProductRequest } from './dto/requests/warehouse-transfer-product.request';
import { Roles } from '../authentication/guards/roles.decorator';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { query } from 'express';
import { WarehouseProductsQuery } from './dto/requests/warehouse-products-query';
import { PageMetaDto } from 'src/core/helpers/pagination/page-meta.dto';
import { PageDto } from 'src/core/helpers/pagination/page.dto';

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
  constructor(
    private readonly warehouseService: WarehouseService,
    private readonly _i18nResponse: I18nResponse,
  ) {}
  @Roles(Role.ADMIN)
  @Get()
  async get(@Query() query: PaginatedRequest) {
    applyQueryIncludes(query, 'region');
    applyQueryIncludes(query, 'region.city');
    applyQueryIncludes(query, 'region.city.country');
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
  @Roles(Role.ADMIN)
  @Post()
  async create(@Body() request: CreateWarehouseRequest) {
    return new ActionResponse(
      await this.warehouseService.create(plainToInstance(Warehouse, request)),
    );
  }

  @Roles(Role.ADMIN)
  @Post()
  async getWarehouseProducts(@Query() query: WarehouseProductsQuery) {
    const { page, limit } = query;

    const products = await this.warehouseService.getWarehouseProduct(query);
    const total = products[1];
    const pageMetaDto = new PageMetaDto(page, limit, total);
    // const data = this._i18nResponse.entity(productsResponse);
    const pageDto = new PageDto(products[0], pageMetaDto);
    return new ActionResponse(pageDto);
  }
  @Roles(Role.ADMIN)
  @Post('operation')
  async createWarehouseOperation(@Body() request: WarehouseOperationRequest) {
    return new ActionResponse(
      await this.warehouseService.CreateWAarehouseOperation(request),
    );
  }
  @Roles(Role.ADMIN)
  @Patch('/:id')
  async update(
    @Body() request: UpdateWarehouseRequest,
    @Query('id') id: string,
  ) {
    return new ActionResponse(
      await this.warehouseService.updateWarehouse(id, request),
    );
  }

  // @Patch("/:warehouse_product_id/transfer/:to_warehouse_id")
  // async transferWarehouseProducts(
  //   @Param("warehouse_product_id") warehouse_product_id: string,
  //   @Param("to_warehouse_id") to_warehouse_id: string,
  //   @Body() body: WarehouseTransferProductRequest
  // ) {
  //   return new ActionResponse(
  //     await this.warehouseService.transferWarehouseProducts(warehouse_product_id, to_warehouse_id, body),
  //   );
  // }

  @Roles(Role.ADMIN)
  @Post('/attach-driver/:warehouse_id/:driver_id')
  async attachDriverToWarehouse(
    @Param('warehouse_id') warehouse_id: string,
    @Param('driver_id') driver_id: string,
  ) {
    return new ActionResponse(
      await this.warehouseService.attachDriverToWarehouse(
        driver_id,
        warehouse_id,
      ),
    );
  }
}
