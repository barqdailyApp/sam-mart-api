import { Module } from '@nestjs/common';
import { CityController } from './city.controller';
import { CityService } from './city.service';
import { CountryModule } from '../country/country.module';

@Module({
  controllers: [CityController],
  providers: [CityService],
  imports:[CountryModule]
})
export class CityModule {}
