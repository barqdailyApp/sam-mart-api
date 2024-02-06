import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Inject,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { MakeOrderRequest } from './dto/request/make-order-request';
import { ActionResponse } from 'src/core/base/responses/action.response';
import { ApiTags, ApiHeader, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { RolesGuard } from '../authentication/guards/roles.guard';
import { ShipmentService } from './shipment.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { AddShipmentChatMessageRequest } from './dto/request/add-shipment-chat-message.request';
import { UploadValidator } from 'src/core/validators/upload.validator';
import { Roles } from '../authentication/guards/roles.decorator';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { ShipmentMessageResponse } from './dto/response/shipment-message.response';
import { plainToInstance } from 'class-transformer';

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
  constructor(private readonly shipmentService: ShipmentService) { }

  @Post('accept/:id')
  async acceptShipment(@Param('id') id: string) {
    return new ActionResponse(await this.shipmentService.acceptShipment(id));
  }


  @Post("add-chat-message/:shipment_id")
  @UseInterceptors(ClassSerializerInterceptor, FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  async addChatMessage(
    @Param('shipment_id') shipment_id: string,
    @Body() req: AddShipmentChatMessageRequest,
    @UploadedFile(new UploadValidator().build()) file: Express.Multer.File,
  ): Promise<ActionResponse<ShipmentMessageResponse>> {
    req.file = file;

    const createdMesssage = await this.shipmentService.addChatMessage(shipment_id, req);
    const result = plainToInstance(ShipmentMessageResponse, createdMesssage, {
      excludeExtraneousValues: true
    });
    return new ActionResponse<ShipmentMessageResponse>(result);
  }

}
