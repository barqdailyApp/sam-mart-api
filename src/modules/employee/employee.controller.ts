import {
    Body,
    ClassSerializerInterceptor,
    Controller, Get, Post, Query, UploadedFile, UseGuards, UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiHeader, ApiTags } from '@nestjs/swagger';
import { EmployeeService } from './employee.service';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { RolesGuard } from '../authentication/guards/roles.guard';
import { Roles } from '../authentication/guards/roles.decorator';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { CreateEmployeeRequest } from './dto/request/create-employee.request';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadValidator } from 'src/core/validators/upload.validator';
import { plainToClass, plainToInstance } from 'class-transformer';
import { EmployeeResponse } from './dto/response/employee.response';
import { ActionResponse } from 'src/core/base/responses/action.response';
import { query } from 'express';
import { PaginatedRequest } from 'src/core/base/requests/paginated.request';
import { PaginatedResponse } from 'src/core/base/responses/paginated.response';

@ApiBearerAuth()
@ApiHeader({
    name: 'Accept-Language',
    required: false,
    description: 'Language header: en, ar',
})
@ApiTags('Employee')
// @UseGuards(JwtAuthGuard, RolesGuard)
@Controller('employee')
export class EmployeeController {
    constructor(
        private readonly employeeService: EmployeeService,
    ) { }

    @Roles(Role.ADMIN)
    @UseInterceptors(ClassSerializerInterceptor, FileInterceptor('avatar_file'))
    @ApiConsumes('multipart/form-data')
    @Post("create")
    async createEmployee(
        @Body() req: CreateEmployeeRequest,
        @UploadedFile(new UploadValidator().build())
        avatar_file: Express.Multer.File,
    ): Promise<ActionResponse<EmployeeResponse>> {
        req.avatar_file = avatar_file;

        const employee = await this.employeeService.createEmployee(req);

        const response = plainToClass(EmployeeResponse, employee, { excludeExtraneousValues: true });
        return new ActionResponse<EmployeeResponse>(response);
    }

    @Roles(Role.ADMIN)
    @Get("all")
    async allEmployees(
        @Query() query: PaginatedRequest,
    ): Promise<ActionResponse<EmployeeResponse[]>> {
        const employees = await this.employeeService.findAllEmployees(query);
        const response = plainToInstance(EmployeeResponse, employees, { excludeExtraneousValues: true });
        if (query.page && query.limit) {
            const total = await this.employeeService.count(query);
            return new PaginatedResponse<EmployeeResponse[]>(response, {
                meta: { total, ...query },
            });
        } else {
            return new ActionResponse<EmployeeResponse[]>(response);
        }
    }
}
