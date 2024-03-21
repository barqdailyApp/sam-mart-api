import { UserService } from './user.service';
import { Module } from '@nestjs/common';
import { Global } from '@nestjs/common/decorators';
import { UserController } from './user.controller';
import { ImageManager } from 'src/integration/sharp/image.manager';
import { StorageManager } from 'src/integration/storage/storage.manager';
import { SendOtpTransaction } from '../authentication/transactions/send-otp.transaction';
import { DeleteClientAccountTransaction } from './transactions/delete-client-account.transaction';

@Global()
@Module({
  imports: [],
  controllers: [UserController],
  providers: [
    UserService,
    ImageManager,
    StorageManager,
    SendOtpTransaction,
    DeleteClientAccountTransaction,
  ],
  exports: [UserService, SendOtpTransaction, DeleteClientAccountTransaction],
})
export class UserModule {}
