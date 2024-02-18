import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { DriverService } from './driver.service';
import { I18nResponse } from 'src/core/helpers/i18n.helper';
import { Driver } from 'typeorm';
import { DriverResponse } from './response/driver.response';
import { plainToClass } from 'class-transformer';
import { UpdateDriverLocationRequest } from './requests/update-driver-location.request';
import { ActionResponse } from 'src/core/base/responses/action.response';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { RolesGuard } from '../authentication/guards/roles.guard';
import { Roles } from '../authentication/guards/roles.decorator';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { UpdateDriverReceiveOrdersRequest } from './requests/update-driver-receive-orders';
@ApiBearerAuth()
@ApiHeader({
  name: 'Accept-Language',
  required: false,
  description: 'Language header: en, ar',
})
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Driver')
@Controller('driver')
export class DriverController {
  constructor(
    private readonly driverService: DriverService,
    @Inject(I18nResponse) private readonly _i18nResponse: I18nResponse,
  ) {}

  @Get('all-drivers')
  async allDrivers() {
    const drivers = await this.driverService.all();
    const driversResponse = drivers.map((driver) =>
      plainToClass(DriverResponse, driver),
    );
    return new ActionResponse(this._i18nResponse.entity(driversResponse));
  }

  @Get(':driver_id/single-driver')
  async singleDriver(@Param('driver_id') id: string) {
    const driver = await this.driverService.single(id);
    const driverResponse = plainToClass(DriverResponse, driver);
    return new ActionResponse(this._i18nResponse.entity(driverResponse));
  }

  @Get('my-profile-driver')
  async myProfileDriver() {
    const driver = await this.driverService.myProfileDriver();
    const driverResponse = plainToClass(DriverResponse, driver);
    return new ActionResponse(this._i18nResponse.entity(driverResponse));
  }
  @Roles(Role.DRIVER)
  @Put(':driver_id/location')
  async updateDriverLocation(
    @Body() updateDriverLocationRequest: UpdateDriverLocationRequest,
  ) {
    return new ActionResponse(
      await this.driverService.updateDriverLocation(
        updateDriverLocationRequest,
      ),
    );
  }
  @Roles(Role.DRIVER)
  @Put('driver-is-receive-orders')
  async updateDriverReceiveOrders(
    @Body() updateDriverReceiveOrdersRequest: UpdateDriverReceiveOrdersRequest,
  ) {
    const driver = await this.driverService.updateDriverStatus(
      updateDriverReceiveOrdersRequest,
    );
    const driverResponse = plainToClass(DriverResponse, driver);
    return new ActionResponse(this._i18nResponse.entity(driverResponse));
  }
}
