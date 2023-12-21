import { Body, Controller, Get, Inject, Param, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DriverService } from './driver.service';
import { I18nResponse } from 'src/core/helpers/i18n.helper';
import { Driver } from 'typeorm';
import { DriverResponse } from './response/driver.response';
import { plainToClass } from 'class-transformer';
import { UpdateDriverLocationRequest } from './requests/update-driver-location.request';
import { ActionResponse } from 'src/core/base/responses/action.response';
@ApiTags('Driver')
@Controller('driver')
export class DriverController {
  constructor(
    private readonly driverService: DriverService,
    @Inject(I18nResponse) private readonly _i18nResponse: I18nResponse,
  ) {}

  @Get('all-drivers')
  async allDrivers(): Promise<Driver[]> {
    const drivers = await this.driverService.all();
    const driversResponse = drivers.map((driver) =>
      plainToClass(DriverResponse, driver),
    );
    return this._i18nResponse.entity(driversResponse);
  }

  @Get(':driver_id/single-driver')
  async singleDriver(@Param('driver_id') id: string) {
    const driver = await this.driverService.single(id);
    const driverResponse = plainToClass(DriverResponse, driver);
    0;
    return new ActionResponse(this._i18nResponse.entity(driverResponse));
  }
  @Put(':driver_id/location')
  async updateDriverLocation(
    @Param('driver_id') driver_id: string,
    @Body() updateDriverLocationRequest: UpdateDriverLocationRequest,
  ) {
    return new ActionResponse(
      await this.driverService.updateDriverLocation(
        driver_id,
        updateDriverLocationRequest,
      ),
    );
  }
}
