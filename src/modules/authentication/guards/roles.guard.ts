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

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(Driver)
    private readonly driverRepository: Repository<Driver>,
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

  
    if (user.user_status == UserStatus.BlockedClient)
      throw new UnauthorizedException(`This account has been blocked`);

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
}
