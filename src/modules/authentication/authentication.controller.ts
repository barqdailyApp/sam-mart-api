import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  HttpStatus,
  Inject,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { ActionResponse } from 'src/core/base/responses/action.response';
import { Router } from 'src/core/base/router';
import { UploadValidator } from 'src/core/validators/upload.validator';
import { AuthenticationService } from './authentication.service';
import { RegisterRequest } from './dto/requests/register.dto';
import { SendOtpRequest } from './dto/requests/send-otp.dto';
import { LoginRequest } from './dto/requests/signin.dto';
import { VerifyOtpRequest } from './dto/requests/verify-otp.dto';
import { AuthResponse } from './dto/responses/auth.response';
import { RegisterResponse } from './dto/responses/register.response';
import { UserInfoResponse } from '../user/dto/responses/profile.response';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { DriverRegisterRequest } from './dto/requests/driver-register.dto';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { Roles } from './guards/roles.decorator';
import { UpdateDriverStatusRequest } from './dto/requests/update-driver-status.request';

@ApiTags(Router.Auth.ApiTag)
@Controller(Router.Auth.Base)
export class AuthenticationController {
  constructor(
    @Inject(AuthenticationService)
    private readonly authService: AuthenticationService,
  ) { }

  @Post(Router.Auth.Signin)
  async signin(
    @Body() req: LoginRequest,
  ): Promise<ActionResponse<AuthResponse>> {
    const authData = await this.authService.login(
      await this.authService.validateUser(req),
    );
    const result = plainToInstance(AuthResponse, authData, {
      excludeExtraneousValues: true,
    });
    return new ActionResponse<AuthResponse>(result);
  }

  @UseInterceptors(ClassSerializerInterceptor, FileInterceptor('avatarFile'))
  @ApiConsumes('multipart/form-data')
  @Post(Router.Auth.Register)
  async register(
    @Body() req: RegisterRequest,
    @UploadedFile(new UploadValidator().build())
    avatarFile: Express.Multer.File,
  ): Promise<ActionResponse<RegisterResponse>> {
    req.avatarFile = avatarFile;

    const user = await this.authService.register(req);
    const result = plainToInstance(RegisterResponse, user, {
      excludeExtraneousValues: true,
    });
    return new ActionResponse<RegisterResponse>(result, {
      statusCode: HttpStatus.CREATED,
    });
  }

  @UseInterceptors(
    ClassSerializerInterceptor,
    FileFieldsInterceptor([
      { name: 'avatarFile', maxCount: 1 },
      { name: 'id_card_image', maxCount: 1 },
      { name: 'license_image', maxCount: 1 },
    ]),
  )
  @ApiConsumes('multipart/form-data')
  @Post('register-driver')
  async registerDriver(
    @Body() req: DriverRegisterRequest,
    @UploadedFiles()
    files: {
      avatarFile: Express.Multer.File;
      id_card_image: Express.Multer.File;
      license_image: Express.Multer.File;
    },
  ): Promise<ActionResponse<RegisterResponse>> {
    if (files.avatarFile) {
      req.avatarFile = files.avatarFile[0];
    }

    req.id_card_image = files.id_card_image[0];
    req.license_image = files.license_image[0];


    const user = await this.authService.driverRegister(req);
    const result = plainToInstance(RegisterResponse, user, {
      excludeExtraneousValues: true,
    });
    return new ActionResponse<RegisterResponse>(result)
  }


  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post(Router.Auth.UpdateDriverStatus)
  async updateDriverStatus(@Body() req: UpdateDriverStatusRequest) {
    const data = await this.authService.updateDriverStatus(req);

    return new ActionResponse(data);
  }

  @Post(Router.Auth.SendOtp)
  async snedOtp(@Body() req: SendOtpRequest): Promise<ActionResponse<string>> {
    const result = await this.authService.sendOtp(req);
    return new ActionResponse<string>(result.toString());
  }

  @Post(Router.Auth.VerifyOtp)
  async verifyOtp(
    @Body() req: VerifyOtpRequest,
  ): Promise<ActionResponse<AuthResponse>> {
    const data = await this.authService.verifyOtp(req);
    const result = plainToInstance(AuthResponse, data, {
      excludeExtraneousValues: true,
    });
    return new ActionResponse<AuthResponse>(result);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(Router.Auth.VerifyPhone)
  async verifyPhone(
    @Body() req: VerifyOtpRequest,
  ): Promise<ActionResponse<UserInfoResponse>> {
    const data = await this.authService.verifyPhone(req);

    const result = new UserInfoResponse(data);
    return new ActionResponse<UserInfoResponse>(result);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(Router.Auth.DeleteAccount)
  async deleteAccount(@Body() req: VerifyOtpRequest) {
    const data = await this.authService.deleteAccount(req);

    return new ActionResponse(data);
  }

}
