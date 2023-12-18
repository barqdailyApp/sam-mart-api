
import { Module } from '@nestjs/common';

import { UserModule } from './user/user.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { CountryModule } from './country/country.module';
import { CityModule } from './city/city.module';
import { RegionModule } from './region/region.module';


@Module({
    imports: [

        UserModule,
        AuthenticationModule,
        CountryModule,
        CityModule,
        RegionModule
    ],
    exports: [

    ],
    providers: [],
})
export class AssemblyModule { }
