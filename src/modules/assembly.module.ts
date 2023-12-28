
import { Module } from '@nestjs/common';

import { UserModule } from './user/user.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { CountryModule } from './country/country.module';
import { CityModule } from './city/city.module';
import { RegionModule } from './region/region.module';
import { DriverModule } from './driver/driver.module';
import { SectionModule } from './section/section.module';
import { CategoryModule } from './category/category.module';


@Module({
    imports: [

        UserModule,
        AuthenticationModule,
        CountryModule,
        CityModule,
        RegionModule,
        DriverModule,
        SectionModule,
        CategoryModule
    ],
    exports: [

    ],
    providers: [],
})
export class AssemblyModule { }
