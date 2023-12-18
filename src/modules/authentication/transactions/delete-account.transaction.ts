import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseTransaction } from 'src/core/base/database/base.transaction';
import { jwtSignOptions } from 'src/core/setups/jwt.setup';
import { Otp } from 'src/infrastructure/entities/auth/otp.entity';
import { UserService } from 'src/modules/user/user.service';
import { DataSource, EntityManager, UpdateResult } from 'typeorm';
import { VerifyOtpRequest } from '../dto/requests/verify-otp.dto';
import { AuthResponse } from '../dto/responses/auth.response';
import { User } from 'src/infrastructure/entities/user/user.entity';
import { RegisterUserTransaction } from './register-user.transaction';
import { RegisterRequest } from '../dto/requests/register.dto';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { UserInfoResponse } from 'src/modules/user/dto/responses/profile.response';
@Injectable()
export class DeleteAccountTransaction extends BaseTransaction<
  VerifyOtpRequest,
  User
> {
  constructor(
    dataSource: DataSource,
    @InjectRepository(Otp) private readonly otpsRepo: typeof Otp,
    @Inject(UserService) private readonly userService: UserService,
    @Inject(RegisterUserTransaction)
    private readonly registerUserTransaction: RegisterUserTransaction,
    @Inject(REQUEST) readonly request: Request,
  ) {
    super(dataSource);
  }

  // the important thing here is to use the manager that we've created in the base class
  protected async execute(
    req: VerifyOtpRequest,
    context: EntityManager,
  ): Promise<User> {
    try {


       
        const user= this.request.user
      // find otp
      const otp = await this.otpsRepo.findOneBy({
        type: req.type,
        username: req.username,
        code: req.code,
      });
      if (!otp) throw new BadRequestException('message.invalid_code');
      if (otp.isExpired())
        throw new BadRequestException('message.code_expired');

  
        user.deleted_at = new Date();
        const timestamp = new Date().getTime();
        user.email = null;
        user.username = `${user.username}_deleted_${timestamp}`;
         user.phone = 'user deleted';
       
      // delete otp
      await this.otpsRepo.remove(otp);
      return await context.save(user);
    } catch (error) {
        console.log(error)
      throw new BadRequestException(error);
    }
  }
}
