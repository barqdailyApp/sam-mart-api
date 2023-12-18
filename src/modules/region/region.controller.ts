import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Param,
  Put,
  Delete,
  Inject,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiHeader } from '@nestjs/swagger';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { RolesGuard } from '../authentication/guards/roles.guard';
import { Country } from 'src/infrastructure/entities/country/country.entity';

import { plainToClass } from 'class-transformer';
import { I18nResponse } from 'src/core/helpers/i18n.helper';
import { RegionService } from './region.service';
import { CreateRegionRequest } from './dto/requests/create-region.request';
import { Region } from 'src/infrastructure/entities/region/region.entity';
import { RegionResponse } from './dto/responses/region.response';
import { UpdateRegionRequest } from './dto/requests/update-region.request';
@ApiTags('Region')
@Controller('region')
export class RegionController {
  constructor(
    private readonly regionService: RegionService,
    @Inject(I18nResponse) private readonly _i18nResponse: I18nResponse,
  ) {}

  @Post('create-region')
  async create(
    @Body() createRegionRequest: CreateRegionRequest,
  ): Promise<Region> {
    return await this.regionService.create(createRegionRequest);
  }

  @Get(':region_id/single-region')
  async single(@Param('region_id') id: string): Promise<RegionResponse> {
    const region = await this.regionService.single(id);
    const regionResponse = plainToClass(RegionResponse, region);
    return this._i18nResponse.entity(regionResponse);
  }
  @Get('all-regions')
  async allRegions(): Promise<RegionResponse[]> {
    const regions = await this.regionService.findAll();
    const regionsResponse = regions.map((region) =>
      plainToClass(RegionResponse, region),
    );
    return this._i18nResponse.entity(regionsResponse);
  }

  @Put(':region_id/update-region')
  async update(
    @Param('region_id') id: string,
    @Body() updateRegionRequest: UpdateRegionRequest,
  ): Promise<void> {
    await this.regionService.update(id, updateRegionRequest);
  }

  @Delete(':region_id/delete-region')
  async delete(@Param('region_id') id: string): Promise<void> {
    await this.regionService.delete(id);
  }
}
