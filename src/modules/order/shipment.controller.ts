import {
  Body,
  Controller,
  Inject,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { MakeOrderRequest } from './dto/make-order-request';
import { ActionResponse } from 'src/core/base/responses/action.response';
import { ApiTags, ApiHeader, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { RolesGuard } from '../authentication/guards/roles.guard';
import { ShipmentService } from './shipment.service';

@ApiTags('Shipment')
@ApiHeader({
  name: 'Accept-Language',
  required: false,
  description: 'Language header: en, ar',
})
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('shipment')
export class ShipmentController {
  constructor(private readonly shipmentService: ShipmentService) {}

  @Post('accept/:id')
  async acceptShipment(@Param('id') id: string) {
    return new ActionResponse(await this.shipmentService.acceptShipment(id));
  }
}
