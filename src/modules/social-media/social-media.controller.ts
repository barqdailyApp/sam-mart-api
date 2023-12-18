import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { SocialMediaService } from './social-media.service';
import { CreateSocialRequest } from './dto/create-social.request';
import { SocialMediaResponse } from './dto/social.response';
import { plainToInstance } from 'class-transformer';
import { I18nResponse } from 'src/core/helpers/i18n.helper';
import { ActionResponse } from 'src/core/base/responses/action.response';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { UpdateSocialRequest } from './dto/update-social.request';
import { DeleteResult } from 'typeorm';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { Roles } from '../authentication/guards/roles.decorator';
import { RolesGuard } from '../authentication/guards/roles.guard';
@ApiBearerAuth()
@ApiHeader({
  name: 'Accept-Language',
  required: false,
  description: 'Language header: en, ar',
})
@ApiTags('Social-media')
@Controller('social-media')
export class SocialMediaController {
  constructor(
    private readonly socialMediaService: SocialMediaService,
    @Inject(I18nResponse) private readonly _i18nResponse: I18nResponse,
  ) {}
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  async createAllSocialMedia(@Body() createSocialRequest: CreateSocialRequest) {
    const create_Social_Media = await this.socialMediaService.createSocialMedia(
      createSocialRequest,
    );

    const entity_To_Dto = new SocialMediaResponse({
      ...create_Social_Media,
    });
    const social_Media_Res = plainToInstance(
      SocialMediaResponse,
      entity_To_Dto,
    );
    const data: SocialMediaResponse =
      this._i18nResponse.entity(social_Media_Res);
    return new ActionResponse<SocialMediaResponse>(data);
  }

  @Get()
  async getAllSocialMedia() {
    const get_all_Social_Media =
      await this.socialMediaService.getAllSocialMedias();

    const social_Media_Res = get_all_Social_Media.map((item) => {
      const entity_To_Dto = new SocialMediaResponse({
        ...item,
      });
      return plainToInstance(SocialMediaResponse, entity_To_Dto);
    });

    const data: SocialMediaResponse =
      this._i18nResponse.entity(social_Media_Res);
    return new ActionResponse<SocialMediaResponse>(data);
  }

  @Get(':id/get-single-SocialMedia')
  async getSingleSocialMedia(@Param('id') id: string) {
    const social_Media_Data =
      await this.socialMediaService.getSingleSocialMedia(id);

    const entity_To_Dto = new SocialMediaResponse({
      ...social_Media_Data,
    });
    const social_Media_Res = plainToInstance(
      SocialMediaResponse,
      entity_To_Dto,
    );
    const data: SocialMediaResponse =
      this._i18nResponse.entity(social_Media_Res);
    return new ActionResponse<SocialMediaResponse>(data);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Put(':id/Update-single-SocialMedia')
  async updateSingleSocialMedia(
    @Param('id') id: string,
    @Body() updateSocialRequest: UpdateSocialRequest,
  ) {
    const social_Media_Data = await this.socialMediaService.updateSocialMedia(
      id,
      updateSocialRequest,
    );

    const entity_To_Dto = new SocialMediaResponse({
      ...social_Media_Data,
    });
    const social_Media_Res = plainToInstance(
      SocialMediaResponse,
      entity_To_Dto,
    );
    const data: SocialMediaResponse =
      this._i18nResponse.entity(social_Media_Res);
    return new ActionResponse<SocialMediaResponse>(data);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id/delete-single-SocialMedia')
  async deleteSingleSocialMedia(@Param('id') id: string) {
    const delete_Social_Media = await this.socialMediaService.deleteSocialMedia(id);

    return new ActionResponse<DeleteResult>(delete_Social_Media);
  }
}
