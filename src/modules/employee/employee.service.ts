import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { BaseService } from 'src/core/base/service/service.base';
import { In, Repository } from 'typeorm';
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
import { UpdateEmployeeRequest } from './dto/request/update-employee.request';
import { AssignEmployeeRequest } from './dto/request/assign-employee.request';
import { SamModules } from 'src/infrastructure/entities/sam-modules/sam-modules.entity';
import { UsersSamModules } from 'src/infrastructure/entities/sam-modules/users-sam-modules.entity';


@Injectable()
export class EmployeeService extends BaseService<Employee> {
    constructor(
        @InjectRepository(Employee) private readonly employeeRepository: Repository<Employee>,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(SamModules) private readonly samModuleRepository: Repository<SamModules>,
        @InjectRepository(UsersSamModules) private readonly userSamModulesRepository: Repository<UsersSamModules>,
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
        // should email be Unique
        const userEmail = await this.userRepository.findOne({ where: { email } });
        if (userEmail) {
            throw new BadRequestException("message.email_exists");
        }
        // should phone be Unique
        const userPhone = await this.userRepository.findOne({ where: { phone } });
        if (userPhone) {
            throw new BadRequestException("message.phone_exists");
        }
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
            is_active
        })

        const createdEmployee = await this.employeeRepository.save(newEmployee);
        await this.assignModule(createdEmployee.id, { module_ids: req.module_ids });
        return createdEmployee;
    }

    async findAllEmployees(query: PaginatedRequest) {
        applyQueryIncludes(query, 'user');
        return await this.findAll(query);
    }
    async singleEmployees(id_employee: string) {
        const employee = await this.employeeRepository.findOne({
            where: { id: id_employee },
            relations: {
                user: {
                    samModules: {
                        samModule: true
                    }
                }
            }
        });

        if (employee && employee.user && Array.isArray(employee.user.samModules)) {
            const transformedSamModules = employee.user.samModules.map(samModuleRelation => {
                const { samModule } = samModuleRelation;
                return samModule ? {
                    id: samModule.id,
                    name_en: samModule.name_en,
                    name_ar: samModule.name_ar

                } as unknown as UsersSamModules : null;
            }).filter(samModule => samModule !== null);

            // Assign the transformed data to a new property
            employee.user.samModules = transformedSamModules;
        }

        if (!employee) {
            throw new BadRequestException('message.employee_not_found');
        }
        return employee
    }

    async updateEmployee(req: UpdateEmployeeRequest, employee_id: string) {
        const employee = await this.employeeRepository.findOne({
            where: { id: employee_id },
            relations: ['user']
        });
        if (!employee) {
            throw new BadRequestException('message.employee_not_found');
        }

        const {
            name_en,
            email,
            phone,
            country_id,
            city_id,
            avatar_file,
            gender,
        } = req;

        if (email) employee.user.email = email;
        if (phone) employee.user.phone = phone;
        if (name_en) employee.user.name = name_en;
        if (gender) employee.user.gender = gender;

        if (avatar_file) {
            const pathAvatar = await this.storageManager.store(
                { buffer: avatar_file.buffer, originalname: avatar_file.originalname },
                { path: 'avatars' }
            )
            employee.user.avatar = pathAvatar;
            delete req.avatar_file;
        }

        if (country_id) await this.countryService.single(country_id);
        if (city_id) await this.cityService.single(city_id);

        Object.assign(employee, req);

        employee.user = await this.userRepository.save(employee.user);
        await this.employeeRepository.save(employee);
        return employee;
    }

    async deleteEmployee(employee_id: string) {
        const employee = await this.employeeRepository.findOne({
            where: { id: employee_id },
            relations: ['user']
        });
        if (!employee) {
            throw new BadRequestException('message.employee_not_found');
        }

        const timestamp = new Date().getTime();

        // soft delete employee.user and deactive his credentials
        employee.deleted_at = new Date();
        employee.user.email = null;
        employee.user.username = `${employee.user.username}_deleted_${timestamp}`;
        employee.user.phone = 'user deleted';


        await this.employeeRepository.softDelete(employee_id);
        await this.userRepository.save(employee.user);
    }

    async assignModule(employee_id: string, body: AssignEmployeeRequest) {
        const { module_ids } = body;
        const employee = await this.employeeRepository.findOne({
            where: { id: employee_id },
            relations: ['user']
        });
        if (!employee) {
            throw new BadRequestException('employee with provided Id not found');
        }

        const uniqueModuleIds = Array.from(new Set(module_ids));
        let samModules = await this.samModuleRepository.find({
            where: {
                id: In(uniqueModuleIds)
            }
        })

        if (module_ids && samModules?.length !== module_ids?.length) {
            throw new BadRequestException(`Provided modules id isn't valid`);
        }

        const userSamModule = await this.userSamModulesRepository.find({
            where: {
                user_id: employee.user?.id,
            }
        })

        await this.userSamModulesRepository.remove(userSamModule);

        const mappedUserSamModules = samModules.map(module => {
            return this.userSamModulesRepository.create({
                user: employee.user,
                samModule: module
            })
        })
        await this.userSamModulesRepository.save(mappedUserSamModules);
    }
}
