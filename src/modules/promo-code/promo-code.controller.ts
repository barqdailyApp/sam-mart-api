import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { PromoCodeService } from './promo-code.service';
import { ActionResponse } from 'src/core/base/responses/action.response';
import { CreateNewPromoCodeRequest } from './dto/create-new-promo-code.request';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { RolesGuard } from '../authentication/guards/roles.guard';
import { UpdatePromoCodeRequest } from './dto/update-promo-code.request';
import { DeleteResult } from 'typeorm';
@ApiBearerAuth()
@ApiHeader({
  name: 'Accept-Language',
  required: false,
  description: 'Language header: en, ar',
})
@ApiTags('promo-code')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('promo-code')
export class PromoCodeController {
  constructor(private readonly promoCodeService: PromoCodeService) {}

  @Get('all-promo-codes')
  async getAllPromoCodes() {
    return new ActionResponse(await this.promoCodeService.allPromoCodes());
  }
  @Get('/:id/single-promo-code')
  async singlePromoCode(@Param('id') id: string) {
    return new ActionResponse(await this.promoCodeService.singlePromoCode(id));
  }
  @Post('create-new-promo-code')
  async createNewPromoCode(
    @Body() createNewPromoCodeRequest: CreateNewPromoCodeRequest,
  ) {
    return new ActionResponse(
      await this.promoCodeService.createPromoCode(createNewPromoCodeRequest),
    );
  }

  @Put(':code_id/update-promo-code')
  async updatePromoCode(
    @Param('code_id') code_id: string,
    @Body() updatePromoCodeRequest: UpdatePromoCodeRequest,
  ) {
    const update_promo_code = await this.promoCodeService.updatePromoCode(
      code_id,
      updatePromoCodeRequest,
    );

    return new ActionResponse(update_promo_code);
  }
  @Delete(':code_id/delete-promo-code')
  async deletePromoCode(
    @Param('code_id') code_id: string,
  ) {
    const delete_promo_code = await this.promoCodeService.deletePromoCode(
      code_id,
    );

    return new ActionResponse<DeleteResult>(delete_promo_code);
  }
}
