import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { BaseTransaction } from 'src/core/base/database/base.transaction';
import { randNum } from 'src/core/helpers/cast.helper';
import { Otp } from 'src/infrastructure/entities/auth/otp.entity';
import { User } from 'src/infrastructure/entities/user/user.entity';
import { DataSource, EntityManager } from 'typeorm';
import { SendOtpRequest } from '../dto/requests/send-otp.dto';
import { SmsProviderService } from '../sms-provider.service';

@Injectable()
export class SendOtpTransaction extends BaseTransaction<
  SendOtpRequest,
  string
> {
  constructor(
    dataSource: DataSource,
    @Inject(ConfigService) private readonly _config: ConfigService,
    @Inject(SmsProviderService) private readonly smsProviderService: SmsProviderService
  ) {
    super(dataSource);
  }

  // the important thing here is to use the manager that we've created in the base class
  protected async execute(
    req: SendOtpRequest,
    context: EntityManager,
  ): Promise<string> {
    try {
      const user = await context.findOneBy<User>(User, {
        [req.type]: req.username, roles: req.role
      });

      // check if user roles contains the role that we're trying to send otp to
      if (!user )
        throw new BadRequestException('message.invalid_credentials');

      const appEnv = this._config.get('app.env');
      // generate code
      let code = '1234' 
   

      // if(appEnv=="production"||req.username!="+967777777777"){
      //      code= randNum(4);
      //   await this.smsProviderService.sendSms(req.username, `للدخول إلى حسابك في برق  يرجى استخدام الرمز ${code}`);}
      // map to otp entity
      const otp = plainToInstance(Otp, { ...req, code });
   
      // delete old otp
      await context.delete(Otp, {
        type: req.type,
        username: user[req.type],
      });
      // save otp
      await context.save(Otp, otp);
      // return code
      return "code";
    } catch (error) {
      throw new BadRequestException(
        this._config.get('app.env') !== 'prod' ?
          error :
          'message.invalid_credentials',
      );
    }
  }
}
