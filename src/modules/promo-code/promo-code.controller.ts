import {
  Body,
  Controller,
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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { RolesGuard } from '../authentication/guards/roles.guard';
import { Roles } from '../authentication/guards/roles.decorator';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { PaginatedRequest } from 'src/core/base/requests/paginated.request';
import { PaginatedResponse } from 'src/core/base/responses/paginated.response';
import { ActionResponse } from 'src/core/base/responses/action.response';
import { PromoCodeResponse } from './dto/response/promo-code.response';
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
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
    const promo_codes = await this.promoCodeService.findAll(query);
    if (query.limit && query.page) {
      const total = await this.promoCodeService.count();
      return new PaginatedResponse(promo_codes, {
        meta: { total, page: query.page, limit: query.limit },
      });
    } else return new ActionResponse(promo_codes);
  }

  @Get(':id')
  async getPromoCodeById(@Query('id') id: string) {
    return new ActionResponse(await this.promoCodeService.findOne(id));
  }

  @Get('valid/:id')
  async getValidPromoCode(@Query('code') code: string) {
    return new ActionResponse(
      plainToInstance(
        PromoCodeResponse,
        await this.promoCodeService.getValidPromoCodeByCode(code),
        { excludeExtraneousValues: true },
      ),
    );
  }
}
