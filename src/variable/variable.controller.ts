import { Body, Controller, Get, Post } from '@nestjs/common';
import { BookingLimitRequest } from './dto/requests/booking-limit-request';
import { request } from 'http';
import { VariableService } from './variable.service';
import { Variable } from 'src/infrastructure/entities/variable/variable.entity';
import { variableTypes } from 'src/infrastructure/data/enums/variable.enum';
import { ApiTags } from '@nestjs/swagger';
import { ActionResponse } from 'src/core/base/responses/action.response';
@ApiTags('Variable')
@Controller('variable')
export class VariableController {
  constructor(private readonly variableService: VariableService) {}

  @Post('booking-limit')
  async bookingLimit(@Body() request: BookingLimitRequest) {

    const variable = new Variable({
      variable: String(request.booking_limit_in_days),
      type: variableTypes.BOOKING_DATE,
    });

    return new ActionResponse( await this.variableService.create(variable));
  }

  @Get('booking-limit')
  async getBookingLimit() {
    
    return new ActionResponse(await this.variableService.getBookinglimit());
  }
}
