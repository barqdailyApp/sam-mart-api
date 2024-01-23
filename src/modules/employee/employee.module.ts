import { Module } from '@nestjs/common';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';


@Module({
  providers: [EmployeeService],
  controllers: [EmployeeController]
})
export class EmployeeModule {}
