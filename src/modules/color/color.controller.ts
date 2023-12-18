import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { I18nResponse } from 'src/core/helpers/i18n.helper';
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
import { CreateColorRequest } from './dto/create-color.request';
import { ColorService } from './color.service';
import { ActionResponse } from 'src/core/base/responses/action.response';
import { Color } from 'src/infrastructure/entities/color/color.entity';
import { UpdateColorRequest } from './dto/update-color.request';
import { DeleteResult } from 'typeorm';
import { Roles } from '../authentication/guards/roles.decorator';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { RolesGuard } from '../authentication/guards/roles.guard';

@ApiBearerAuth()
@ApiHeader({
  name: 'Accept-Language',
  required: false,
  description: 'Language header: en, ar',
})
@ApiTags('Color')
@Controller('color')
export class ColorController {
  constructor(
    private readonly colorService: ColorService,
    @Inject(I18nResponse) private readonly _i18nResponse: I18nResponse,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  async createColor(@Body() createColorRequest: CreateColorRequest) {
    const create_color = await this.colorService.createColor(
      createColorRequest,
    );
    const data: Color = this._i18nResponse.entity(create_color);
    return new ActionResponse<Color>(data);
  }
  @Get()
  async getAllColors() {
    const get_colors = await this.colorService.getAllColors();
    const data: Color[] = this._i18nResponse.entity(get_colors);

    return new ActionResponse<Color[]>(data);
  }
  @Get(':id/get-single-color')
  async getSingleColor(@Param('id') id: string) {
    const get_color = await this.colorService.getSingleColor(id);
    const data: Color = this._i18nResponse.entity(get_color);

    return new ActionResponse<Color>(data);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Put(':id/update-single-color')
  async updateColor(
    @Param('id') id: string,
    updateColorRequest: UpdateColorRequest,
  ) {
    const get_color = await this.colorService.updateColor(
      id,
      updateColorRequest,
    );
    const data: Color = this._i18nResponse.entity(get_color);

    return new ActionResponse<Color>(data);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id/delete-single-color')
  async deleteColor(@Param('id') id: string) {
    const delete_color = await this.colorService.deleteColor(id);

    return new ActionResponse<DeleteResult>(delete_color);
  }
}
