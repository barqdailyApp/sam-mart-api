import { AssemblyModule } from './modules/assembly.module';
import { IntegrationModule } from './integration/integration.module';
import { UserModule } from './modules/user/user.module';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { AuthenticationModule } from './modules/authentication/authentication.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './core/core.module';
import { FileModule } from './modules/file/file.module';
import { AddressModule } from './modules/address/address.module';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { RestaurantModule } from './modules/restaurant/restaurant.module';

@Module({
  imports: [
    AssemblyModule, // ?Assembly
    CoreModule, // !Global
    InfrastructureModule, // !Global
    IntegrationModule, // !Global
    UserModule, // !Global
    AuthenticationModule, // !Global
    FileModule, // !Global
    AddressModule, RestaurantModule,
  ],
  controllers: [AppController],

  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
