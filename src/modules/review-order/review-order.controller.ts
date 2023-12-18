import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ReviewOrderService } from './review-order.service';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { Roles } from '../authentication/guards/roles.decorator';
import { RolesGuard } from '../authentication/guards/roles.guard';
import { CreateReviewOrderRequest } from './dto/create-review-order.request';
import { ActionResponse } from 'src/core/base/responses/action.response';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
@ApiBearerAuth()
@ApiHeader({
  name: 'Accept-Language',
  required: false,
  description: 'Language header: en, ar',
})
@ApiTags('Review-order')
@Controller('review-order')
export class ReviewOrderController {
  constructor(private readonly reviewOrderService: ReviewOrderService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CLIENT)
  @Post('create-review-order')
  async createReviewOrder(
    @Body() createReviewOrderRequest: CreateReviewOrderRequest,
  ) {
    const data = await this.reviewOrderService.createReviewOrder(
      createReviewOrderRequest,
    );
    return new ActionResponse(data);
  }
}
