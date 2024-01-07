import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { WarehouseService } from './warehouse.service';
import { WarehouseOperationRequest } from './dto/requests/warehouse-operation.request';
import { ApiBearerAuth, ApiTags, ApiHeader } from '@nestjs/swagger';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { RolesGuard } from '../authentication/guards/roles.guard';
import { CreateWarehouseRequest } from './dto/requests/create-warehouse.request';
import { plainToInstance } from 'class-transformer';
import { Warehouse } from 'src/infrastructure/entities/warehouse/warehouse.entity';
import { ActionResponse } from 'src/core/base/responses/action.response';

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
  constructor(private readonly warehouseService: WarehouseService) {}

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
}
