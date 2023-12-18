import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { AppConstantsService } from './app-constants.service';
import { AppConstantsResponse } from './dto/app-constants.response';
import { plainToInstance } from 'class-transformer';
import { ActionResponse } from 'src/core/base/responses/action.response';
import { UpdateAppConstantsRequest } from './dto/update-app-constants.request';
@ApiHeader({
  name: 'Accept-Language',
  required: false,
  description: 'Language header: en, ar',
})
@ApiTags('App-constants')
@Controller('app-constants')
export class AppConstantsController {
  constructor(private readonly appConstantsService: AppConstantsService) {}

  @Get()
  async getAppConstants() {
    const app_constants_Data = await this.appConstantsService.getAppConstants();

    const entity_To_Dto = new AppConstantsResponse(app_constants_Data);
    const app_constants_Res = plainToInstance(
      AppConstantsResponse,
      entity_To_Dto,
    );
    return new ActionResponse<AppConstantsResponse>(app_constants_Res);
  }
  @Put()
  async updateAppConstants(
    @Body() updateAppConstantsRequest: UpdateAppConstantsRequest,
  ) {
    const app_constants_Data =
      await this.appConstantsService.updateAppConstants(
        updateAppConstantsRequest,
      );

    const entity_To_Dto = new AppConstantsResponse(app_constants_Data);
    const app_constants_Res = plainToInstance(
      AppConstantsResponse,
      entity_To_Dto,
    );
    return new ActionResponse<AppConstantsResponse>(app_constants_Res);
  }
}
