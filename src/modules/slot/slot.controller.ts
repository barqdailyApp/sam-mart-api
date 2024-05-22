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
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { SlotService } from './slot.service';
import { I18nResponse } from 'src/core/helpers/i18n.helper';
import { plainToClass } from 'class-transformer';
import { ActionResponse } from 'src/core/base/responses/action.response';
import { CreateSlotRequest } from './dto/requests/create-slot.request';
import { UpdateSlotRequest } from './dto/requests/update-slot.request';
import { SlotResponse } from './dto/responses/slot.response';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { Roles } from '../authentication/guards/roles.decorator';
import { RolesGuard } from '../authentication/guards/roles.guard';

@ApiBearerAuth()
@ApiHeader({
  name: 'Accept-Language',
  required: false,
  description: 'Language header: en, ar',
})
@ApiTags('Slot')
@Controller('slot')
export class SlotController {
  constructor(
    private readonly slotService: SlotService,
    @Inject(I18nResponse) private readonly _i18nResponse: I18nResponse,
  ) {}
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('create-slot')
  async create(@Body() createSlotRequest: CreateSlotRequest) {
    return new ActionResponse(await this.slotService.create(createSlotRequest));
  }

  @Get(':slot_id/single-slot')
  async single(@Param('slot_id') id: string) {
    const slot = await this.slotService.single(id);
    const slotResponse = plainToClass(SlotResponse, slot);
    return new ActionResponse(this._i18nResponse.entity(slotResponse));
  }
  @Get(':delivery_day/all-slots')
  async allCountries(@Param('delivery_day') delivery_day: string) {
    const slots = await this.slotService.findAll(delivery_day);
    const slotsResponse = slots.map((slot) => plainToClass(SlotResponse, slot));
    return new ActionResponse(this._i18nResponse.entity(slotsResponse));
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Put(':slot_id/update-slot')
  async update(
    @Param('slot_id') id: string,
    @Body() updateSlotRequest: UpdateSlotRequest,
  ) {
    return new ActionResponse(
      await this.slotService.update(id, updateSlotRequest),
    );
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':slot_id/delete-slot')
  async delete(@Param('slot_id') id: string) {
    return new ActionResponse(await this.slotService.delete(id));
  }
}
