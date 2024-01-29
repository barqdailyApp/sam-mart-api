import { Module } from '@nestjs/common';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { CountryService } from '../country/country.service';
import { CityService } from '../city/city.service';


@Module({
  providers: [EmployeeService, CountryService, CityService],
  controllers: [EmployeeController]
})
export class EmployeeModule { }
