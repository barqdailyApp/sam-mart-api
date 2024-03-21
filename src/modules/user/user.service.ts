import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  Scope,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/infrastructure/entities/user/user.entity';
import { DataSource, Repository } from 'typeorm';
import { BaseService } from 'src/core/base/service/service.base';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { FileService } from '../file/file.service';
import { UpdateProfileRequest } from './dto/requests/update-profile.request';
import { ImageManager } from 'src/integration/sharp/image.manager';
import * as sharp from 'sharp';
import { StorageManager } from 'src/integration/storage/storage.manager';
import { SendOtpTransaction } from '../authentication/transactions/send-otp.transaction';
import { UpdateFcmTokenRequest } from './requests/update-fcm-token.request';
import { UsersDashboardQuery } from './dto/filters/user-dashboard.query';
import { UserStatus } from 'src/infrastructure/data/enums/user-status.enum';
import { UserStatusRequest } from './dto/requests/update-user-status.request';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { DeleteClientAccountTransaction } from './transactions/delete-client-account.transaction';

@Injectable({ scope: Scope.REQUEST })
export class UserService extends BaseService<User> {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,

    @Inject(FileService) private _fileService: FileService,
    @Inject(REQUEST) readonly request: Request,
    @Inject(StorageManager) private readonly storageManager: StorageManager,
    @Inject(ImageManager) private readonly imageManager: ImageManager,
    @Inject(SendOtpTransaction)
    private readonly sendOtpTransaction: SendOtpTransaction,
    @Inject(DeleteClientAccountTransaction)
    private readonly deleteAccountTransaction: DeleteClientAccountTransaction,
  ) {
    super(userRepo);
  }

  async allowNotification(allow_notification: boolean) {
    await this.userRepo.update(
      { id: this.currentUser.id },
      { allow_notification },
    );
  }

  async updateProfile(updatdReq: UpdateProfileRequest) {
    if (updatdReq.user_id && !this.currentUser.roles.includes(Role.ADMIN)) {
      throw new UnauthorizedException(
        'You are not allowed to update other users',
      );
    }

    const user = await this.userRepo.findOne({
      where: { id: updatdReq.user_id ?? this.currentUser.id },
    });

    if (updatdReq.delete_avatar) {
      await this._fileService.delete(user.avatar);
      user.avatar = null;
    }

    if (updatdReq.avatarFile) {
      // resize image to 300x300
      const resizedImage = await this.imageManager.resize(
        updatdReq.avatarFile,
        {
          size: { width: 300, height: 300 },
          options: {
            fit: sharp.fit.cover,
            position: sharp.strategy.entropy,
          },
        },
      );

      // save image
      const path = await this.storageManager.store(
        {
          buffer: resizedImage,
          originalname: updatdReq.avatarFile.originalname,
        },
        { path: 'avatars' },
      );

      user.avatar = path;
    }

    Object.assign(user, updatdReq);

    if (updatdReq.phone) {
      const userExists = await this.userRepo.findOne({
        where: { phone: updatdReq.phone },
      });

      if (userExists && userExists.id !== user.id) {
        throw new BadRequestException('Phone number already exists');
      }

      if (!this.currentUser.roles.includes(Role.ADMIN)) {
        await this.sendOtpTransaction.run({
          type: 'phone',
          username: updatdReq.phone,
        });
      } else {
        user.phone = updatdReq.phone;
        user.username = updatdReq.phone;
      }
    }

    return await this.userRepo.save(user);
  }

  async updateFcmToken(updateFcmTokenRequest: UpdateFcmTokenRequest) {
    const { fcmToken } = updateFcmTokenRequest;
    await this.userRepo.update(
      { id: this.currentUser.id },
      { fcm_token: fcmToken },
    );
  }

  get currentUser(): User {
    return this.request.user;
  }

  async getAllClientsDashboard(usersDashboardQuery: UsersDashboardQuery) {
    const { page, limit, created_at, client_search, status } =
      usersDashboardQuery;
    const skip = (page - 1) * limit;

    let query = this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.wallet', 'wallet')
      .leftJoinAndSelect('user.addresses', 'addresses')
      .where('user.roles = :role', { role: Role.CLIENT })
      .skip(skip)
      .take(limit);

    if (created_at) {
      //*using database functions to truncate the time part of the order.created_at timestamp to compare only the date components
      query = query.andWhere('DATE(user.created_at) = :created_at', {
        created_at,
      });
    }
    if (client_search) {
      query = query.andWhere(
        '(user.name LIKE :client_search OR user.phone LIKE :client_search OR user.email LIKE :client_search)',
        { client_search: `%${client_search}%` },
      );
    }

    if (status) {
      query = query.andWhere('user.user_status = :status', { status });
    }

    const [users, total] = await query.getManyAndCount();
    return { users, total };
  }
  async getSingleClientDashboard(user_id: string) {
    const user = await this.userRepo.findOne({
      where: { id: user_id },
      relations: {
        wallet: true,
        addresses: true,
      },
    });
    if (!user) throw new NotFoundException('user not found');
    return user;
  }
  async getTotalClientsDashboard() {
    const clientsTotal = await this.userRepo.count({
      where: {
        roles: Role.CLIENT,
      },
    });
    const clientsActive = await this.userRepo.count({
      where: {
        user_status: UserStatus.ActiveClient,
        roles: Role.CLIENT,
      },
    });

    const clientsPurchased = await this.userRepo.count({
      where: {
        user_status: UserStatus.CustomerPurchase,
        roles: Role.CLIENT,
      },
    });

    const clientsBlocked = await this.userRepo.count({
      where: {
        user_status: UserStatus.BlockedClient,
        roles: Role.CLIENT,
      },
    });
    return {
      total: clientsTotal,
      active: clientsActive,
      purchased: clientsPurchased,
      blocked: clientsBlocked,
    };
  }
  async changeClientStatusDashboard(userStatusRequest: UserStatusRequest) {
    const { status, user_id } = userStatusRequest;
    const user = await this.userRepo.findOne({ where: { id: user_id } });
    if (!user) throw new NotFoundException('user not found');

    return await this.userRepo.update({ id: user_id }, { user_status: status });
  }
  async deleteClientDashboard(user_id: string) {
    return await this.deleteAccountTransaction.run({ user_id });
   
  }
}
