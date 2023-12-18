import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './authentication.controller';
import { Module, Global } from '@nestjs/common';
import { RegisterUserTransaction } from './transactions/register-user.transaction';
import { SendOtpTransaction } from './transactions/send-otp.transaction';
import { JwtService } from '@nestjs/jwt';
import { VerifyOtpTransaction } from './transactions/verify-otp.transaction';
import { JwtStrategy } from './strategies/jwt.strategy';
import JWTSetup from 'src/core/setups/jwt.setup';
import { VerifyPhoneTransaction } from './transactions/edit-phone.transaction';
import { DeleteAccountTransaction } from './transactions/delete-account.transaction';
import { RegisterDriverTransaction } from './transactions/register-driver.transaction';

@Global()
@Module({
    imports: [
        JWTSetup(),
    ],
    controllers: [
        AuthenticationController
    ],
    providers: [
        AuthenticationService,
        RegisterUserTransaction,
        RegisterDriverTransaction,
        SendOtpTransaction,
        VerifyOtpTransaction,
        JwtService,
        JwtStrategy,
        VerifyPhoneTransaction,
        DeleteAccountTransaction,

    ],
    exports: [
        AuthenticationService,
    ],
})
export class AuthenticationModule { }
