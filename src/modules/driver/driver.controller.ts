import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiHeader,
  ApiTags,
} from '@nestjs/swagger';
import { DriverService } from './driver.service';
import { I18nResponse } from 'src/core/helpers/i18n.helper';
import { Driver } from 'typeorm';
import { DriverResponse } from './response/driver.response';
import { plainToClass, plainToInstance } from 'class-transformer';
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
import { DriverStatusRequest } from './requests/update-driver-status.request';
import { DriverClientResponse } from './response/driver-client.response';
import {
  FileInterceptor,
  FileFieldsInterceptor,
} from '@nestjs/platform-express';
import { UploadValidator } from 'src/core/validators/upload.validator';
import { DriverRegisterRequest } from '../authentication/dto/requests/driver-register.dto';
import { RegisterRequest } from '../authentication/dto/requests/register.dto';
import { RegisterResponse } from '../authentication/dto/responses/register.response';
import { UpdateProfileDriverRequest } from './requests/update-profile-driver.request';
@ApiBearerAuth()
@ApiHeader({
  name: 'Accept-Language',
  required: false,
  description: 'Language header: en, ar',
})
//@UseGuards(JwtAuthGuard, RolesGuard)
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

  @Get('single-driver')
  async singleDriver() {
    const driver = await this.driverService.single();
    const driverResponse = new DriverClientResponse(driver);
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
  //delete client
  @Roles(Role.ADMIN)
  @Delete('delete-driver/:driver_id')
  async deleteClientDashboard(@Param('driver_id') driver_id: string) {
    const result = await this.driverService.deleteDriverDashboard(driver_id);
    return new ActionResponse(result);
  }

  @UseInterceptors(
    ClassSerializerInterceptor,
    FileFieldsInterceptor([
      { name: 'avatarFile', maxCount: 1 },
      { name: 'id_card_image', maxCount: 1 },
      { name: 'license_image', maxCount: 1 },
    ]),
  )
  @ApiConsumes('multipart/form-data')
  @Roles(Role.ADMIN)
  @Put('update-profile-driver')
  async updateProfileDriver(
    @Body() req: UpdateProfileDriverRequest,
    @UploadedFiles()
    files: {
      avatarFile: Express.Multer.File;
      id_card_image: Express.Multer.File;
      license_image: Express.Multer.File;
    },
  ): Promise<ActionResponse<RegisterResponse>> {
    if (files.avatarFile) {
      req.avatarFile = files.avatarFile[0];
    }
    if (files.id_card_image) {
      req.id_card_image = files.id_card_image[0];
    }
    if (files.license_image) {
      req.license_image = files.license_image[0];
    }
    const driver = await this.driverService.updateProfileDriver(req);
    const driverResponse = new DriverDashboardResponse(driver);
    return new ActionResponse(this._i18nResponse.entity(driverResponse));
  }
}
