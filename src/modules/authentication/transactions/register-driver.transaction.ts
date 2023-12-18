import { ConfigService } from '@nestjs/config';
import { DataSource, EntityManager } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { RegisterRequest } from '../dto/requests/register.dto';
import { User } from 'src/infrastructure/entities/user/user.entity';
import { randStr } from 'src/core/helpers/cast.helper';
import { BaseTransaction } from 'src/core/base/database/base.transaction';
import { ImageManager } from 'src/integration/sharp/image.manager';
import * as sharp from 'sharp';
import { StorageManager } from 'src/integration/storage/storage.manager';

import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { DriverRegisterRequest } from '../dto/requests/driver-register.dto';
import { Driver } from 'src/infrastructure/entities/driver/driver.entity';

@Injectable()
export class RegisterDriverTransaction extends BaseTransaction<
  DriverRegisterRequest,
  User
> {
  constructor(
    dataSource: DataSource,
    @Inject(ConfigService) private readonly _config: ConfigService,
    @Inject(StorageManager) private readonly storageManager: StorageManager,
    @Inject(ImageManager) private readonly imageManager: ImageManager,
  ) {
    super(dataSource);
  }

  // the important thing here is to use the manager that we've created in the base class
  protected async execute(
    req: DriverRegisterRequest,
    context: EntityManager,
  ): Promise<User> {
    try {
      const { username, email, phone, role } = req;
      const {
        avatarFile,

        country_id,
        region_id,
        address,
        latitude,
        longitude,
        id_card_number,
        id_card_image,
        license_number,
        license_image,
        vehicle_color,
        vehicle_model,
        vehicle_type,
      } = req;
       //* Create User
      const createUser = context.create(User, {
        username,
        email,
        phone
        
      });

      // encrypt password
      const randomPassword = randStr(12);
      createUser.password = await bcrypt.hash(
        randomPassword + this._config.get('app.key'),
        10,
      );

      // set user role
      createUser.roles = [req.role == null ? Role.CLIENT : req.role];
      // set user avatar
       const resizedImage = await this.imageManager.resize(req.avatarFile, {
        size: { width: 300, height: 300 },
        options: {
          fit: sharp.fit.cover,
          position: sharp.strategy.entropy
        },
      });

      // save image
      const path = await this.storageManager.store(
        { buffer: resizedImage, originalname: req.avatarFile.originalname },
        { path: 'avatars' },
      );

      // set avatar path
      createUser.avatar = path;

      // save user
      const savedUser = await context.save(User, createUser);


      const CreateDriver = context.create(Driver, {
        user_id: savedUser.id,
        country_id,
        region_id,
        address,
        latitude,
        longitude,
        id_card_number,
        id_card_image,
        license_number,
        license_image,
        vehicle_color,
        vehicle_model,
        vehicle_type,
      });
      const savedDriver = await context.save(Driver, CreateDriver);

      // return user
      return savedUser;
    } catch (error) {
      throw new BadRequestException(
        this._config.get('app.env') !== 'prod'
          ? error
          : 'message.register_failed',
      );
    }
  }
}
