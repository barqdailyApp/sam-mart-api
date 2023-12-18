import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  ParseBoolPipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { BikerService } from './biker.service';
import { UpdateUserLocationRequest } from './dto/requests/update-user-location.request';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiHeader,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { RolesGuard } from '../authentication/guards/roles.guard';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { Roles } from '../authentication/guards/roles.decorator';
import { ActionResponse } from 'src/core/base/responses/action.response';
import { BikerResponse } from './dto/response/biker.response';
import { BikerFilterRequest } from './dto/requests/biker-filter.request';
import { OrderResponse } from '../order/dto/response/order-response';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateBikerRequest } from './dto/requests/biker-update.request';
import { UploadValidator } from 'src/core/validators/upload.validator';
import { query } from 'express';
import { PaginatedRequest } from 'src/core/base/requests/paginated.request';
@ApiBearerAuth()
@ApiHeader({
  name: 'Accept-Language',
  required: false,
  description: 'Language header: en, ar',
})
@ApiTags('Biker')
@Controller('biker')
export class BikerController {
  constructor(private readonly bikerService: BikerService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.BIKER)
  @Put('/location')
  async updateUserLocation(@Body() location: UpdateUserLocationRequest) {
    await this.bikerService.updateUserLocation(location);
    return true;
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Put('/:user_id/active-biker/:is_active')
  async activeBiker(
    @Param('user_id') user_id: string,
    @Param('is_active', ParseBoolPipe) is_active: boolean,
  ) {
    return await this.bikerService.activeBiker(is_active, user_id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('all-bikers')
  async getAllBikers(@Query() query: PaginatedRequest) {
    const all_bikers = await this.bikerService.findAll(query);
    const all_bikers_dto = all_bikers.map((item) => new BikerResponse(item));
    return all_bikers_dto;
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.BIKER)
  @Get('biker-profile')
  async myBikerProfile() {
    const {
      biker,
      total_point_current_month,
      total_order_current_month,
      total_notification,
    } = await this.bikerService.getBikerProfile();
    const biker_dto = new BikerResponse(biker);
    biker_dto.notification_is_read = total_notification > 0 ? false : true;

    return {
      total_point_current_month,
      total_order_current_month,
      biker: biker_dto,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.BIKER)
  @Get('biker-order-monthly')
  async myBikerOrderMonthly(@Query() bikerFilterRequest: BikerFilterRequest) {
    const { orders, total } = await this.bikerService.getBikerOrders(
      bikerFilterRequest,
    );
    const order_dto = orders.map((item) => new OrderResponse(item));
    return {
      total,
      order: order_dto,
    };
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.BIKER)
  @Get('biker-points-monthly')
  async myBikerPointsMonthly(@Query() bikerFilterRequest: BikerFilterRequest) {
    const points_orders= await this.bikerService.getBikerPoints(
      bikerFilterRequest,
    );
    return points_orders;
  }

  @UseInterceptors(ClassSerializerInterceptor, FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @Put('/profile-biker/:id')
  async updateDriverProfile(
    @Body() updateBikerRequest: UpdateBikerRequest,
    @Param('id') id: string,
    @UploadedFile(new UploadValidator().build()) file: Express.Multer.File,
  ) {
    updateBikerRequest.file = file;
    await this.bikerService.updateBikerProfile(updateBikerRequest, id);
    return {
      message: 'success update biker profile',
    };
  }
}
