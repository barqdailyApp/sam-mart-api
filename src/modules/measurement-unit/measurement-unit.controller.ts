import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { I18nResponse } from 'src/core/helpers/i18n.helper';
import { MeasurementUnitService } from './measurement-unit.service';
import { CreateMeasurementUnitRequest } from './dto/requests/create-measurement-unit.request';
import { ActionResponse } from 'src/core/base/responses/action.response';
import { UpdateMeasurementUnitRequest } from './dto/requests/update-measurement-unit.request';
import { plainToClass } from 'class-transformer';
import { MeasurementUnitResponse } from './dto/responses/measurement-unit.response';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { Roles } from '../authentication/guards/roles.decorator';

@ApiBearerAuth()
@ApiHeader({
  name: 'Accept-Language',
  required: false,
  description: 'Language header: en, ar',
})
@ApiTags('Measurement-Unit')
@Controller('measurement-unit')
export class MeasurementUnitController {
  constructor(
    private readonly measurementUnitService: MeasurementUnitService,
    @Inject(I18nResponse) private readonly _i18nResponse: I18nResponse,
  ) {}
  @Roles(Role.ADMIN)
  @Get('all-measurement-units')
  async allMeasurementUnits() {
    const measurementUnits = await this.measurementUnitService.findAll();
    const measurementUnitsResponse = measurementUnits.map((measurementUnit) =>
      plainToClass(MeasurementUnitResponse, measurementUnit),
    );
    const dataTranslate = this._i18nResponse.entity(measurementUnitsResponse);
    return new ActionResponse(measurementUnitsResponse);
  }
  @Get(':measurement_unit_id/measurement-unit')
  async singleMeasurementUnit(@Param('measurement_unit_id') id: string) {
    const measurementUnit = await this.measurementUnitService.single(id);
    const measurementUnitResponse = plainToClass(
      MeasurementUnitResponse,
      measurementUnit,
    );
    const dataTranslate = this._i18nResponse.entity(measurementUnitResponse);

    return new ActionResponse(measurementUnitResponse);
  }
  @Roles(Role.ADMIN)
  @Post('create-measurement-unit')
  async createMeasurementUnit(
    @Body() createMeasurementUnitRequest: CreateMeasurementUnitRequest,
  ) {
    return new ActionResponse(
      await this.measurementUnitService.create(createMeasurementUnitRequest),
    );
  }
  @Roles(Role.ADMIN)
  @Put(':measurement_unit_id/update-measurement-unit')
  async updateMeasurementUnit(
    @Param('measurement_unit_id') id: string,
    @Body() updateMeasurementUnitRequest: UpdateMeasurementUnitRequest,
  ) {
    return new ActionResponse(
      await this.measurementUnitService.update(
        id,
        updateMeasurementUnitRequest,
      ),
    );
  }
  @Roles(Role.ADMIN)
  @Delete(':measurement_unit_id/delete-measurement-unit')
  async deleteMeasurementUnit(@Param('measurement_unit_id') id: string) {
    return new ActionResponse(await this.measurementUnitService.delete(id));
  }
}
