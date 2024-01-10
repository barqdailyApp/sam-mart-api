import { Inject, Injectable, Scope } from '@nestjs/common';
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



@Injectable({ scope: Scope.REQUEST })
export class UserService extends BaseService<User> {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,

    @Inject(FileService) private _fileService: FileService,
    @Inject(REQUEST) readonly request: Request,
    @Inject(StorageManager) private readonly storageManager: StorageManager,
    @Inject(ImageManager) private readonly imageManager: ImageManager,
    @Inject(SendOtpTransaction) private readonly sendOtpTransaction: SendOtpTransaction,
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
    const user = await this.userRepo.findOne({ where: { id: this.currentUser.id } });

    if (updatdReq.delete_avatar) {
      await this._fileService.delete(user.avatar);
      user.avatar = null;
    }

    if (updatdReq.avatarFile) {
      // resize image to 300x300
      const resizedImage = await this.imageManager.resize(updatdReq.avatarFile, {
        size: { width: 300, height: 300 },
        options: {
          fit: sharp.fit.cover,
          position: sharp.strategy.entropy
        },
      });

      // save image
      const path = await this.storageManager.store(
        { buffer: resizedImage, originalname: updatdReq.avatarFile.originalname },
        { path: 'avatars' },
      );

      user.avatar = path;
    }

    Object.assign(user, updatdReq);
    await this.userRepo.save(user);
    
    if (updatdReq.phone) {
      await this.sendOtpTransaction.run({ type: 'phone', username: updatdReq.phone })
    }
  }

  get currentUser(): User {
    return this.request.user;
  }
}
