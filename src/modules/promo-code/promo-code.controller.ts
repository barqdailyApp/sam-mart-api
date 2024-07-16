import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreatePromoCodeRequest } from './dto/request/create-promo-code.request';
import { PromoCodeService } from './promo-code.service';
import { plainToInstance } from 'class-transformer';
import { PromoCode } from 'src/infrastructure/entities/promo-code/promo-code.entity';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { RolesGuard } from '../authentication/guards/roles.guard';
import { Roles } from '../authentication/guards/roles.decorator';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { PaginatedRequest } from 'src/core/base/requests/paginated.request';
import { PaginatedResponse } from 'src/core/base/responses/paginated.response';
import { ActionResponse } from 'src/core/base/responses/action.response';
import { PromoCodeResponse } from './dto/response/promo-code.response';
import { applyQueryIncludes } from 'src/core/helpers/service-related.helper';
import { where } from 'sequelize';
@ApiHeader({
  name: 'Accept-Language',
  required: false,
  description: 'Language header: en, ar',
})
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.CLIENT,Role.DRIVER)
@ApiTags('Promo Code')

@Controller('promo-code')
export class PromoCodeController {
  constructor(private readonly promoCodeService: PromoCodeService) {}
  @Roles(Role.ADMIN)
  @Post()
  async createPromoCode(@Body() request: CreatePromoCodeRequest) {
    return new ActionResponse(
      await this.promoCodeService.create(plainToInstance(PromoCode, request)),
    );
  }
  @Roles(Role.ADMIN)
  @Put()
  async editPromoCode(@Body() request: CreatePromoCodeRequest) {
    return new ActionResponse(
      await this.promoCodeService.update(plainToInstance(PromoCode, request)),
    );
  }
  @Roles(Role.ADMIN)
  @Get()
  async getPromoCode(@Query() query: PaginatedRequest) {
    applyQueryIncludes(query,"payment_methods");
    const promo_codes = await this.promoCodeService.findAll(query);
    if (query.limit && query.page) {
      const total = await this.promoCodeService.count(query);
      return new PaginatedResponse(promo_codes, {
        meta: { total, page: query.page, limit: query.limit },
      });
    } else return new ActionResponse(promo_codes);
  }

  @Get(':id')
  async getPromoCodeById(@Query('id') id: string) {
    return new ActionResponse(await this.promoCodeService._repo.findOne({where:{id},relations:['payment_methods']}));
  }

  @Post("/:id/:payment_method_id")
  async addPromoCodePaymentMethod(@Query('id') id: string,@Query('payment_method_id') payment_method_id: string) {
    return new ActionResponse(await this.promoCodeService.addPaymentMethodToPromoCode(id,payment_method_id));
  }

  @Delete("/:id/:payment_method_id")
  async deletePromoCodePaymentMethod(@Query('id') id: string,@Query('payment_method_id') payment_method_id: string) {
    return new ActionResponse(await this.promoCodeService.removePaymentMethodFromPromoCode(id,payment_method_id));
  }

  @Get('valid/:id')
  async getValidPromoCode(@Query('code') code: string,@Query('payment_method_id') payment_method_id?: string) {
    return new ActionResponse(
      plainToInstance(
        PromoCodeResponse,
        await this.promoCodeService.getValidPromoCodeByCode(code,payment_method_id),
        { excludeExtraneousValues: true },
      ),
    );
  }
}
