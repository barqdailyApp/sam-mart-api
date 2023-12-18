import {
  ApiBearerAuth,
  ApiConsumes,
  ApiHeader,
  ApiTags,
} from '@nestjs/swagger';
import { I18nResponse } from 'src/core/helpers/i18n.helper';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { BannerService } from './banner.service';
import { create } from 'domain';
import { CreateBannerRequest } from './dto/requests/create-banner-request';
import { plainToInstance } from 'class-transformer';
import { Banner } from 'src/infrastructure/entities/banner/banner';
import { ActionResponse } from 'src/core/base/responses/action.response';
import { query } from 'express';
import { PaginatedRequest } from 'src/core/base/requests/paginated.request';
import { PaginatedResponse } from 'src/core/base/responses/paginated.response';
import { UploadValidator } from 'src/core/validators/upload.validator';
import { FileInterceptor } from '@nestjs/platform-express';
import * as bcrypt from 'bcrypt';
import { BannerResponse } from './dto/respone/banner-response';
@ApiBearerAuth()
@ApiHeader({
  name: 'Accept-Language',
  required: false,
  description: 'Language header: en, ar',
})
@ApiTags('Banner')
@Controller('banner')
export class BannerController {
  constructor(
    @Inject(BannerService) private readonly bannerService: BannerService,
  ) {}
  @UseInterceptors(ClassSerializerInterceptor, FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @Post()
  async create(
    @Body() request: CreateBannerRequest,
    
    @UploadedFile(new UploadValidator().build()) file: Express.Multer.File,
  ) {
    request.file = file;
    const result = await this.bannerService.createBanner(request);
    const respone = plainToInstance(BannerResponse, result, {
      excludeExtraneousValues: true,
    });
    return new ActionResponse(respone);
  }

  @Get()
  async findAll(@Query() query: PaginatedRequest) {
    const result = await this.bannerService.findAll(query);
    const respone = plainToInstance(BannerResponse, result, {
      excludeExtraneousValues: true,
    });
    if (query.page && query.limit) {
      const total = await this.bannerService.count();
      return new PaginatedResponse(respone, { meta: { total, ...query } });
    } else {
      return new ActionResponse(respone);
    }
  }

  @Get('all-banners')
  async findAllBanner() {
    const banners = await this.bannerService.getAllBanner();
    const banners_res = plainToInstance(BannerResponse, banners, {
      excludeExtraneousValues: true,
    });
    return new ActionResponse(banners_res);
  }

  @UseInterceptors(ClassSerializerInterceptor, FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @Put('/:id')
  async update(
    @Param('id') id: string,
    @Body() updateBannerRequest: CreateBannerRequest,
    @UploadedFile(new UploadValidator().build()) file: Express.Multer.File,
  ) {
    const banner = await this.bannerService.findOne(id);
    banner.name = updateBannerRequest.name;

    updateBannerRequest.file = file;
    await this.bannerService.updateImage(banner, updateBannerRequest);
    const result = await this.bannerService.update(banner);

    const respone = plainToInstance(BannerResponse, result, {
      excludeExtraneousValues: true,
    });
    return new ActionResponse(respone);
  }

  @Delete('/:id')
  async delete(@Param('id') id: string) {
    return new ActionResponse(this.bannerService.delete(id));
  }
}
