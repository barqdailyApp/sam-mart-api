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
import { CountryModule } from '../country/country.module';
import { RegionModule } from '../region/region.module';
import { CityModule } from '../city/city.module';
import { SmsProviderService } from './sms-provider.service';

@Global()
@Module({
    imports: [
        JWTSetup(),
        CountryModule,
        RegionModule,
        CityModule
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
        SmsProviderService

    ],
    exports: [
        AuthenticationService,
        SmsProviderService
    ],
})
export class AuthenticationModule { }
