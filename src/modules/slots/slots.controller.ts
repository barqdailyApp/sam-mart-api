import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SlotsService } from './slots.service';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { ActionResponse } from 'src/core/base/responses/action.response';
import { CreateSlotRequest } from './dto/requests/create-slot-request';
import { request } from 'http';
import { plainToInstance } from 'class-transformer';
import { Slot } from 'src/infrastructure/entities/slot/slot.entity';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { Roles } from '../authentication/guards/roles.decorator';
import { RolesGuard } from '../authentication/guards/roles.guard';
import { UpdateSlotRequest } from './dto/requests/update-slot.request';
@ApiBearerAuth()
@ApiHeader({
  name: 'Accept-Language',
  required: false,
  description: 'Language header: en, ar',
})
@ApiTags('Slots')
@Controller('slots')
export class SlotsController {
  constructor(private readonly slotService: SlotsService) {}

  @Get('/all-available-slots/:date')
  async getAvailable(@Param('date') date: string) {
    return new ActionResponse(
      await this.slotService.getAllAvailableDaySlot(date),
    );
  }
  @Roles(Role.BIKER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/all-available-driver-slots/:date')
  async getAvailableDriverSlot(@Param('date') date: string) {
    return new ActionResponse(
      await this.slotService.getDriverAvailableDaySlot(date),
    );
  }

  @Post()
  async createSlot(@Body() request: CreateSlotRequest) {
    const slot = plainToInstance(Slot, request);
    return new ActionResponse(await this.slotService.create(slot));
  }

  @Delete('/:id')
  async deleteSlot(@Param('id') id: string) {
    return new ActionResponse(await this.slotService.softDelete(id));
  }

  @Put('update-slot')
  async updateSlot(@Body() updateSlotRequest: UpdateSlotRequest) {
    return new ActionResponse(
      await this.slotService.updateDaySlot(updateSlotRequest),
    );
  }
}
