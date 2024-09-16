import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { MakeOrderRequest } from './dto/request/make-order-request';
import { ActionResponse } from 'src/core/base/responses/action.response';
import {
  ApiTags,
  ApiHeader,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
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
import { GetCommentQueryRequest } from '../support-ticket/dto/request/get-comment-query.request';
import { AddShipmentFeedBackRequest } from './dto/request/add-shipment-feedback.request';
import { CancelShipmentRequest } from './dto/request/cancel-shipment.request';
import { ShipmentResponse } from './dto/response/shipment.response';

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

  @Post('driver/accept/:id')
  async acceptShipment(@Param('id') id: string) {
    return new ActionResponse(
      plainToInstance(
        ShipmentResponse,
        await this.shipmentService.acceptShipment(id),
      ),
    );
  }

  @Post('admin/process/:id')
  @Roles(Role.ADMIN)
  async processShipment(@Param('id') id: string) {
    return new ActionResponse(
      plainToInstance(
        ShipmentResponse,
        await this.shipmentService.prepareShipment(id),
      ),
    );
  }

  @Post('admin/ready-for-pickup/:id')
  @Roles(Role.ADMIN)
  async readyForPickup(@Param('id') id: string) {
    return new ActionResponse(
      plainToInstance(
        ShipmentResponse,
        await this.shipmentService.shipmentReadyForPickup(id),
      ),
    );
  }

  @Post('driver/pick-up/:id')
  async pickUpShipment(@Param('id') id: string) {
    return new ActionResponse(
      plainToInstance(
        ShipmentResponse,
        await this.shipmentService.pickupShipment(id),
      ),
    );
  }

  @Post('driver/deliver/:id')
  async delivershipment(@Param('id') id: string) {
    return new ActionResponse(
      plainToInstance(
        ShipmentResponse,
        await this.shipmentService.deliverShipment(id),
      ),
    );
  }
  @Post('admin/deliver/:id')
  async adminDelivershipment(@Param('id') id: string) {
    return new ActionResponse(
      plainToInstance(
        ShipmentResponse,
        await this.shipmentService.adminDeliverShipment(id),
      ),
    );
  }

  @Post('add-chat-message/:shipment_id')
  @UseInterceptors(ClassSerializerInterceptor, FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  async addChatMessage(
    @Param('shipment_id') shipment_id: string,
    @Body() req: AddShipmentChatMessageRequest,
    @UploadedFile(new UploadValidator().build()) file: Express.Multer.File,
  ): Promise<ActionResponse<ShipmentMessageResponse>> {
    req.file = file;

    const createdMesssage = await this.shipmentService.addChatMessage(
      shipment_id,
      req,
    );
    const result = plainToInstance(ShipmentMessageResponse, createdMesssage, {
      excludeExtraneousValues: true,
    });
    return new ActionResponse<ShipmentMessageResponse>(result);
  }

  @Get('get-messages/:shipment_id')
  async getMessagesByShipmentId(
    @Param('shipment_id') shipment_id: string,
    @Query() query: GetCommentQueryRequest,
  ): Promise<ActionResponse<ShipmentMessageResponse[]>> {
    const messages = await this.shipmentService.getMessagesByShipmentId(
      shipment_id,
      query,
    );
    const result = plainToInstance(ShipmentMessageResponse, messages, {
      excludeExtraneousValues: true,
    });
    return new ActionResponse<ShipmentMessageResponse[]>(result);
  }

  @Post('add-shipment-feedback')
  async addShipmentFeedback(
    @Body() addShipmentFeedBackRequest: AddShipmentFeedBackRequest,
  ) {
    return new ActionResponse(
      await this.shipmentService.addShipmentFeedBack(
        addShipmentFeedBackRequest,
      ),
    );
  }

  @Post('assign-driver/:shipment_id/:driver_id')
  @Roles(Role.ADMIN)
  async assignDriver(
    @Param('shipment_id') shipment_id: string,
    @Param('driver_id') driver_id: string,
  ) {
    return new ActionResponse(
      plainToInstance(
        ShipmentResponse,
        await this.shipmentService.assignDriver(shipment_id, driver_id),
      ),
    );
  }

  @Post('replace-assignd-driver/:shipment_id/:driver_id')
  @Roles(Role.ADMIN)
  async replaceDriver(
    @Param('shipment_id') shipment_id: string,
    @Param('driver_id') driver_id: string,
  ) {
    return new ActionResponse(
      plainToInstance(
        ShipmentResponse,
        await this.shipmentService.assignDriverToShipment(shipment_id, driver_id),
      ),
    );
  }

  @Post('cancel-shipment/:shipment_id')
  async cancelShipment(
    @Param('shipment_id') shipment_id: string,
    @Body() req: CancelShipmentRequest,
  ) {
    return new ActionResponse(
      plainToInstance(
        ShipmentResponse,
        await this.shipmentService.cancelShipment(shipment_id, req),
      ),
    );
  }

  @Post('product-checked/:shipment_product_id')
  @Roles(Role.ADMIN)
  async checkProduct(
    @Param('shipment_product_id') shipment_product_id: string,
   
  ) {
    return new ActionResponse(
      plainToInstance(
        ShipmentResponse,
        await this.shipmentService.checkShipmentProduct(shipment_product_id),
      ),
    );
  }

  // admin convert order from scheduled to fast delivery [Order Controller]
}
