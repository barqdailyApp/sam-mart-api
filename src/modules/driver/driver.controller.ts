import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Put,
  Query,
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
import { GetDriversQueryRequest } from './requests/get-drivers-query.request';
import { DriversDashboardQuery } from './filters/driver-dashboard.query';
import { DriverDashboardResponse } from './response/driver-dashboard.response';
import { PageMetaDto } from 'src/core/helpers/pagination/page-meta.dto';
import { PageDto } from 'src/core/helpers/pagination/page.dto';
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

  @Roles(Role.ADMIN)
  @Get('all-drivers')
  async allDrivers(@Query() query: GetDriversQueryRequest) {
    const drivers = await this.driverService.all(query.warehouse_id);
    const driversResponse = drivers.map((driver) =>
      plainToClass(DriverResponse, driver),
    );
    return new ActionResponse(this._i18nResponse.entity(driversResponse));
  }

  @Get('all-drivers-dashboard')
  async allDriversDashboard(
    @Query() driversDashboardQuery: DriversDashboardQuery,
  ) {
    const { limit, page } = driversDashboardQuery;
    const { drivers, total } = await this.driverService.allDriversDashboard(
      driversDashboardQuery,
    );
    const driversResponse = drivers.map(
      (driver) => new DriverDashboardResponse(driver),
    );
    const pageMetaDto = new PageMetaDto(page, limit, total);
    const pageDto = new PageDto(driversResponse, pageMetaDto);

    return new ActionResponse(pageDto);
  }
  @Get('single-driver-dashboard/:driver_id')
  async singleDriverDashboard(@Param('driver_id') id: string) {
    const driver = await this.driverService.singleDriverDashboard(id);
    const driverResponse = new DriverDashboardResponse(driver);
    return new ActionResponse(driverResponse);
  }
  @Get('total-driver-dashboard')
  async totalClientDashboard() {
    const total = await this.driverService.totalDriverDashboard();
    return new ActionResponse(total);
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
  @Put('location')
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
