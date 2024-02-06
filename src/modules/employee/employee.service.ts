import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { BaseService } from 'src/core/base/service/service.base';
import { Repository } from 'typeorm';
import { Employee } from 'src/infrastructure/entities/employee/employee.entity';
import { CreateEmployeeRequest } from './dto/request/create-employee.request';
import { User } from 'src/infrastructure/entities/user/user.entity';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { StorageManager } from 'src/integration/storage/storage.manager';
import { FileService } from '../file/file.service';
import { ImageManager } from 'src/integration/sharp/image.manager';
import { randNum, randStr } from 'src/core/helpers/cast.helper';
import { ConfigService } from '@nestjs/config';
import { buffer } from 'stream/consumers';
import { CityService } from '../city/city.service';
import { CountryService } from '../country/country.service';
import { PaginatedRequest } from 'src/core/base/requests/paginated.request';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { BaseUserService } from 'src/core/base/service/user-service.base';
import { applyQueryFilters, applyQueryIncludes } from 'src/core/helpers/service-related.helper';


@Injectable()
export class EmployeeService extends BaseService<Employee> {
    constructor(
        @InjectRepository(Employee) private readonly employeeRepository: Repository<Employee>,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @Inject(CountryService) private readonly countryService: CountryService,
        @Inject(CityService) private readonly cityService: CityService,
        @Inject(ConfigService) private readonly _config: ConfigService,
        @Inject(StorageManager) private readonly storageManager: StorageManager,
        @Inject(ImageManager) private readonly imageManager: ImageManager,
        @Inject(REQUEST) request: Request,
    ) {
        super(employeeRepository);
        // super(employeeRepository, request);
    }

    async createEmployee(req: CreateEmployeeRequest) {
        const {
            name_en,
            avatar_file,
            email,
            gender,
            phone,
        } = req;


        // generate rendom username
        let username = (name_en.replace(/\s/g, '_') + '_' + randNum(5)).toLowerCase();

        // check if username exists
        let userExists = await this.userRepository.findOne({ where: { username } });
        let tries = 0;

        // if username exists, generate another one. Max tries = 10
        while (userExists && tries < 10) {
            username = (name_en.replace(/\s/g, '_') + '_' + randNum(5)).toLowerCase();
            userExists = await this.userRepository.findOne({ where: { username } });
            tries++;
        }

        if (userExists) {
            throw new BadRequestException('Username already exists, change name or try again');
        }

        const newUser = await this.userRepository.create({
            name: name_en,
            roles: [Role.EMPLOYEE],
            phone: phone,
            email: email,
            gender: gender,
            username,
        })

        newUser.password = await bcrypt.hash(
            username + this._config.get('app.key'),
            10,
        );

        if (avatar_file) {
            const pathAvatar = await this.storageManager.store(
                { buffer: avatar_file.buffer, originalname: avatar_file.originalname },
                { path: 'avatars' }
            )

            newUser.avatar = pathAvatar;
        }
        const savedUser = await this.userRepository.save(newUser);

        const {
            name_ar,
            city_id,
            country_id,
            qualification,
            departements,
            is_active,
        } = req;
        await this.countryService.single(country_id);

        await this.cityService.single(city_id);

        const newEmployee = await this.employeeRepository.create({
            user: savedUser,
            name_ar,
            name_en,
            city_id,
            country_id,
            qualification,
            departements,
            is_active
        })

        return await this.employeeRepository.save(newEmployee);
    }

    async findAllEmployees(query: PaginatedRequest) {
        applyQueryIncludes(query, 'user');
        return await this.findAll(query);
    }
}
