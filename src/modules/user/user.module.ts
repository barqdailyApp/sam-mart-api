import { UserService } from './user.service';
import { Module } from '@nestjs/common';
import { Global } from '@nestjs/common/decorators';
import { UserController } from './user.controller';
import { ImageManager } from 'src/integration/sharp/image.manager';
import { StorageManager } from 'src/integration/storage/storage.manager';
import { SendOtpTransaction } from '../authentication/transactions/send-otp.transaction';

@Global()
@Module({
    imports: [],
    controllers: [UserController],
    providers: [UserService, ImageManager, StorageManager, SendOtpTransaction],
    exports: [UserService]
})
export class UserModule { }
