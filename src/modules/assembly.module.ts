
import { Module } from '@nestjs/common';

import { UserModule } from './user/user.module';
import { AuthenticationModule } from './authentication/authentication.module';


@Module({
    imports: [

        UserModule,
        AuthenticationModule
    ],
    exports: [

    ],
    providers: [],
})
export class AssemblyModule { }
