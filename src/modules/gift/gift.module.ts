import { Module } from '@nestjs/common';
import { GiftController } from './gift.controller';
import { GiftService } from './gift.service';
import { SendGiftTransaction } from './util/send-gift.transaction';
import { AuthenticationModule } from '../authentication/authentication.module';
import { RegisterUserTransaction } from '../authentication/transactions/register-user.transaction';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [AuthenticationModule, NotificationModule],
  controllers: [GiftController],
  providers: [GiftService, SendGiftTransaction],
  exports: [GiftModule, GiftService],
})
export class GiftModule {}
