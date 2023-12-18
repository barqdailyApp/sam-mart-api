import { ConfigService } from '@nestjs/config';
import { SmsService } from './sms.service';
import { Global, Module } from '@nestjs/common';

@Global()
@Module({
    imports: [],
    controllers: [],
    providers: [
        SmsService,
    ],
    exports: [
        SmsService
    ]
})
export class SmsModule { }
