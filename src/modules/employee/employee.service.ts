import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/core/base/service/service.base';
import { Repository } from 'typeorm';
import { Employee } from 'src/infrastructure/entities/employee/employee.entity';

@Injectable()
export class EmployeeService extends BaseService<Employee> {
    constructor(
        @InjectRepository(Employee) private readonly employeeRepository: Repository<Employee>,
    ) {
        super(employeeRepository);
    }
}
