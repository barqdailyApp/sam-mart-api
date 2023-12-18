import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseBoolPipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiHeader,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { I18nResponse } from 'src/core/helpers/i18n.helper';
import { RolesGuard } from '../authentication/guards/roles.guard';
import { UserService } from './user.service';

import { Request } from 'express';

import { REQUEST } from '@nestjs/core';

import { UpdateProfileRequest } from './dto/requests/update-profile.request';

import {
  ProfileResponse,
  UserInfoResponse,
} from './dto/responses/profile.response';
import { UploadValidator } from 'src/core/validators/upload.validator';
import { UploadFileRequest } from '../file/dto/requests/upload-file.request';
import { FileService } from '../file/file.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateFcmRequest } from './dto/requests/update-fcm.request';
import { ActionResponse } from 'src/core/base/responses/action.response';
import { UpdateLanguageRequest } from './dto/requests/update-language.request';

@ApiBearerAuth()
@ApiTags('User')
@ApiHeader({
  name: 'Accept-Language',
  required: false,
  description: 'Language header: en, ar',
})
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UserController {
  constructor(
    private readonly _service: UserService,
    @Inject(REQUEST) readonly request: Request,
    @Inject(I18nResponse) private readonly _i18nResponse: I18nResponse,
  ) {}

  //update name
  @UseInterceptors(ClassSerializerInterceptor, FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @Put('/profile')
  async updateProfile(
    @Body() req: UpdateProfileRequest,
    @UploadedFile(new UploadValidator().build()) file: Express.Multer.File,
  ) {
    const user = this.request.user;

    req.file = file;
    if (req.file || req.delete_avatar) await this._service.updateImage(req);
    user.email = req.email;
    user.first_name = req.first_name;
    user.last_name = req.last_name;
    const result = await this._service.update(user);
    return new UserInfoResponse(result);
  }

  @Get('/profile')
  async getPorfile() {
    return await this._service.getProfile();
  }
  @Put('/status-notifications/:status')
  async statusNotifications(@Param('status', ParseBoolPipe) status: boolean) {
    await this._service.statusNotification(status);
    return {
      message: 'success change status notifications',
    };
  }

  @Post('/test-sms')
  async testSms(@Query() phone: string, message: string) {
    await this._service.testSms(phone, message);
  }
  @Put('/fcm-token')
  async updateFcmToken(@Body() req: UpdateFcmRequest) {
    const user = await this._service.findOne(req.user_id);
    user.fcm_token = req.fcm_token;
    await this._service.update(user);
    return await this._service.getProfile();
  }

   //update language
   @Put('/language')
   async updateLanguage(
     @Body() req: UpdateLanguageRequest,
   ) {
    const user = await this._service.findOne(req.user_id);

     user.language = req.language;
     await this._service.update(user);
    return await this._service.getProfile();
   }
}
