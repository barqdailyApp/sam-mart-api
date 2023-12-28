import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { BaseTransaction } from 'src/core/base/database/base.transaction';
import { randNum } from 'src/core/helpers/cast.helper';
import { Otp } from 'src/infrastructure/entities/auth/otp.entity';
import { User } from 'src/infrastructure/entities/user/user.entity';
import { DataSource, EntityManager } from 'typeorm';
import { SendOtpRequest } from '../dto/requests/send-otp.dto';
import { RegisterUserTransaction } from './register-user.transaction';
import { RegisterRequest } from '../dto/requests/register.dto';
import { Role } from 'src/infrastructure/data/enums/role.enum';

@Injectable()
export class SendOtpTransaction extends BaseTransaction<
  SendOtpRequest,
  string
> {
  constructor(
    dataSource: DataSource,
    @Inject(ConfigService) private readonly _config: ConfigService,
  ) {
    super(dataSource);
  }

  // the important thing here is to use the manager that we've created in the base class
  protected async execute(
    req: SendOtpRequest,
    context: EntityManager,
  ): Promise<string> {
    try {
      const appEnv = this._config.get('app.env');
      // generate code
      // const code = appEnv === 'local' ? '1234' : randNum(4);
      const code = '1234';

      // map to otp entity
      const otp = plainToInstance(Otp, { ...req, code });
      // delete old otp
      await context.delete(Otp, {
        type: req.type,
        username: req.username,
      });
      // save otp

      await context.save(Otp, otp);

      return code.toString();
    } catch (error) {
      throw new BadRequestException('message.invalid_credentials');
    }
  }
}
