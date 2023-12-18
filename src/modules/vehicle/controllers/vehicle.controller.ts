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
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiHeader,
  ApiTags,
} from '@nestjs/swagger';
import { ActionResponse } from 'src/core/base/responses/action.response';
import { I18nResponse } from 'src/core/helpers/i18n.helper';
import { Role } from 'src/infrastructure/data/enums/role.enum';

import { JwtAuthGuard } from 'src/modules/authentication/guards/jwt-auth.guard';
import { Roles } from 'src/modules/authentication/guards/roles.decorator';
import { RolesGuard } from 'src/modules/authentication/guards/roles.guard';
import { CreateVehicleRequest } from '../dto/requests/create-vehicle.request';
import { UpdateVehicleRequest } from '../dto/requests/update-vehicle.request';
import { VehicleResponse } from '../dto/responses/vehicle.respone';
import { VehicleImageService } from '../services/vehicle-image-service';
import { VehicleService } from '../services/vehicle.service';
import { plainToInstance } from 'class-transformer';
import { Vehicle } from 'src/infrastructure/entities/vehicle/vehicle.entity';

@ApiBearerAuth()
@ApiTags('Vehicles')
@ApiHeader({
  name: 'Accept-Language',
  required: false,
  description: 'Language header: en, ar',
})
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('vehicles')
export class VehicleController {
  constructor(
    private _service: VehicleService,
    private _vehicleImagesService: VehicleImageService,
    @Inject(I18nResponse) private readonly _i18nResponse: I18nResponse,
  ) {}

  @Get()
  @Roles(Role.CLIENT)
  async getDefaultVehicle(): Promise<ActionResponse<VehicleResponse[]>> {
    const vehicles = await this._service.getDefaultVehicles();
    const vehicle_Res = vehicles.map((item) => {
      return new VehicleResponse({
        ...item,
      });
    });

    const data = this._i18nResponse.entity(vehicle_Res);

    return new ActionResponse<VehicleResponse[]>(data);
  }

  @Post()
  @Roles(Role.CLIENT)
  @ApiConsumes('application/json')
  async createVehicle(
    @Body() req: CreateVehicleRequest,
  ): Promise<ActionResponse<VehicleResponse[]>> {
    const created = await this._service.createVehicle(req);
    const vehicle = await this._service.getSingleVehicle(created.id);
    const vehicle_res = new VehicleResponse({
      ...vehicle,
    });
    const data = this._i18nResponse.entity(vehicle_res);

    return new ActionResponse(data);
  }

  @Put()
  @Roles(Role.CLIENT)
  @ApiConsumes('application/json')
  async updateVehicle(
    @Body() req: UpdateVehicleRequest,
  ): Promise<ActionResponse<VehicleResponse>> {
    await this._service.updateVehicle(req);
    const get_vehicle = await this._service.getSingleVehicle(req.id);
    const vehicle_res = new VehicleResponse(get_vehicle);
    const data = this._i18nResponse.entity(vehicle_res);

    return new ActionResponse(data);
  }
  @Delete(':id')
  @Roles(Role.CLIENT)
  async deleteVehicle(
    @Param('id') id: string,
  ): Promise<ActionResponse<Vehicle>> {
    const data = await this._service.deleteVehicle(id);
    return new ActionResponse(data);
  }
}
