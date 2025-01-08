import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { ROLES_KEY } from './roles.decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { Driver } from 'src/infrastructure/entities/driver/driver.entity';
import { Repository } from 'typeorm';
import { DriverStatus } from 'src/infrastructure/data/enums/driver-status.enum';
import { UserStatus } from 'src/infrastructure/data/enums/user-status.enum';
import { User } from 'src/infrastructure/entities/user/user.entity';
import { Employee } from 'src/infrastructure/entities/employee/employee.entity';
import { UsersSamModules } from 'src/infrastructure/entities/sam-modules/users-sam-modules.entity';
import { Request } from 'express';
import { replaceUUIDInURL } from 'src/core/helpers/replace-url-uuid.helper';
import { SamModulesEndpoints } from 'src/infrastructure/entities/sam-modules/sam-modules-endpoints.entity';
import { removeQueryFromUrl } from 'src/core/helpers/cast.helper';
import { RestaurantAdmin } from 'src/infrastructure/entities/restaurant/restaurant-admin.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(Driver)
    private readonly driverRepository: Repository<Driver>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(RestaurantAdmin)
    private readonly restaurantAdminRepository: Repository<RestaurantAdmin>,
    @InjectRepository(UsersSamModules)
    private readonly userSamModulesRepository: Repository<UsersSamModules>,
  ) {}

  async canActivate(context: ExecutionContext) {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const { user } = request;

    if (requiredRoles == Array(Role.DRIVER)) {
      await this.checkDriverStatus(user, requiredRoles);
    }

    if (user.roles?.includes(Role.EMPLOYEE)) {
      const isAuthorizedEmployee = await this.checkEmployeeModulePermissions(
        user,
        request.url,
        request.method,
      );

      if (!isAuthorizedEmployee) {
        throw new UnauthorizedException('Unauthorized employee');
      } else {
        return true;
      }
    }

    if (user.roles?.includes(Role.RESTAURANT_ADMIN)) {
      await this.checkRestaurantModulePermissions(user, request);
    }

    if (user.user_status == UserStatus.BlockedClient)
      throw new UnauthorizedException(`message.user_is_blocked`);

    return requiredRoles.some((role) => user.roles?.includes(role));
  }

  async checkDriverStatus(user: any, requiredRoles: Role[]) {
    const driver = await this.driverRepository.findOne({
      where: { user_id: user.id },
    });

    if (!driver) throw new UnauthorizedException('invalid_driver');

    if (driver.status !== DriverStatus.VERIFIED) {
      throw new UnauthorizedException(
        `You're not verified driver, your account is ${
          driver.status
        } now reason: ${driver.status_reason ?? 'no reason specified'}`,
      );
    }
  }

  async checkEmployeeModulePermissions(
    user: User,
    path: string,
    method: string,
  ): Promise<boolean> {
    path = replaceUUIDInURL(path);
    path = removeQueryFromUrl(path);
    const employee = await this.employeeRepository.findOne({
      where: { user_id: user.id },
    });

    if (!employee) throw new UnauthorizedException('invalid_employee');
    console.log(path);
    const userSamModule = await this.userSamModulesRepository.findOne({
      where: {
        user_id: user.id,
        samModule: { samModuleEndpoints: { endpoint: path } },
      },
      relations: {
        samModule: {
          samModuleEndpoints: true,
        },
      },
    });

    if (userSamModule) {
      return true;
    }

    return false;
  }

  async checkRestaurantModulePermissions(user: User, request: Request) {
    {
      const restaurantId = request.params.restaurantId;
      const restaurantAdmin = await this.restaurantAdminRepository.findOne({
        where: { user: { id: user.id }, restaurant: { id: restaurantId } },
      });
      if (!restaurantAdmin) {
       throw new UnauthorizedException('invalid_restaurant_admin'); 
      }
      
    }
  }
}
