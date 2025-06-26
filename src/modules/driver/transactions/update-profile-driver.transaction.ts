import { ConfigService } from '@nestjs/config';
import { DataSource, EntityManager } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from 'src/infrastructure/entities/user/user.entity';
import { randStr } from 'src/core/helpers/cast.helper';
import { BaseTransaction } from 'src/core/base/database/base.transaction';
import { ImageManager } from 'src/integration/sharp/image.manager';
import * as sharp from 'sharp';
import { StorageManager } from 'src/integration/storage/storage.manager';

import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { Driver } from 'src/infrastructure/entities/driver/driver.entity';
import { RegionService } from 'src/modules/region/region.service';
import { CountryService } from 'src/modules/country/country.service';
import { CityService } from 'src/modules/city/city.service';
import { FileService } from 'src/modules/file/file.service';
import { Wallet } from 'src/infrastructure/entities/wallet/wallet.entity';
import { UpdateProfileDriverRequest } from '../requests/update-profile-driver.request';
import { Employee } from 'src/infrastructure/entities/employee/employee.entity';
import { Country } from 'src/infrastructure/entities/country/country.entity';
import { City } from 'src/infrastructure/entities/city/city.entity';
import { Region } from 'src/infrastructure/entities/region/region.entity';

@Injectable()
export class UpdateProfileDriverTransaction extends BaseTransaction<
  UpdateProfileDriverRequest,
  Driver
> {
  constructor(
    dataSource: DataSource,
    @Inject(ConfigService) private readonly _config: ConfigService,
    @Inject(StorageManager) private readonly storageManager: StorageManager,
    @Inject(ImageManager) private readonly imageManager: ImageManager,
    @Inject(FileService) private readonly _fileService: FileService,
  ) {
    super(dataSource);
  }

  // the important thing here is to use the manager that we've created in the base class
  protected async execute(
    req: UpdateProfileDriverRequest,
    context: EntityManager,
  ): Promise<Driver> {
    try {
      //* This Data user needed
      const {
        driver_id,
        name,
        email,
        phone,
        avatarFile,
        birth_date,
        country_id,
        city_id,
        region_id,
        id_card_image,
        id_card_number,
        license_image,
        license_number,
        vehicle_color,
        vehicle_model,
        type,
        vehicle_type,
      } = req;
      //* -------------------- Update User Driver ----------------------------

      const driver = await context.findOne(Driver, {
        where: { id: driver_id },
        relations: { user: true },
      });

      if (!driver) {
        throw new BadRequestException('message.driver_not_found');
      }
      if (email) {
        const userEmail = await context.findOne(Driver, {
          where: {
            user: {
              email,
            },
          },
        });
        if (userEmail && driver.user.email != email) {
          throw new BadRequestException('message.email_exists');
        }

        driver.user.email = email;
      }
      if (phone) {
        // should phone be Unique
        const userPhone = await context.findOne(Driver, {
          where: {
            user: {
              phone,
            },
          },
        });
        if (userPhone && driver.user.phone != phone) {
          throw new BadRequestException('message.phone_exists');
        }
        driver.user.phone = phone;
        driver.user.username = phone;
      }

      if (avatarFile) {
        const pathAvatar = await this.storageManager.store(
          { buffer: avatarFile.buffer, originalname: avatarFile.originalname },
          { path: 'avatars' },
        );

        //* set avatar path
        driver.user.avatar = pathAvatar;
      }

      if (birth_date) {
        driver.user.birth_date = birth_date;
      }

      if (type) {
        driver.type = type;
      }
      await context.update(User, driver.user_id, {
        username: driver.user.username,
        email: driver.user.email,
        phone: driver.user.phone,
        birth_date: driver.user.birth_date,
        name: name,
        avatar: driver.user.avatar,
      });

      //* -------------------- Update Driver ----------------------------

      //* check country
      if (country_id) {
        const country = await context.findOne(Country, {
          where: {
            id: country_id,
          },
        });

        if (!country) {
          throw new BadRequestException('message.country_not_found');
        }
        driver.country_id = country_id;
      }

      //* check city
      if (city_id) {
        const city = await context.findOne(City, {
          where: {
            id: city_id,
          },
        });

        if (!city) {
          throw new BadRequestException('message.city_not_found');
        }

        driver.city_id = city_id;
      }

      //* check region
      if (region_id) {
        const region = await context.findOne(Region, {
          where: {
            id: region_id,
          },
        });

        if (!region) {
          throw new BadRequestException('message.region_not_found');
        }

        driver.region_id = region_id;
      }

      //* save IdCardImage
      if (id_card_image) {
        const pathIdCardImage = await this.storageManager.store(
          {
            buffer: id_card_image.buffer,
            originalname: id_card_image.originalname,
          },
          { path: 'id_card_images' },
        );

        driver.id_card_image = pathIdCardImage;
      }

      //* save licenseImage
      if (license_image) {
        const pathLicenseImage = await this.storageManager.store(
          {
            buffer: license_image.buffer,
            originalname: license_image.originalname,
          },
          { path: 'license_images' },
        );

        //* set licenseImage path
        driver.license_image = pathLicenseImage;
      }

      if (vehicle_type) {
        driver.vehicle_type = vehicle_type;
      }
      if (vehicle_color) {
        driver.vehicle_color = vehicle_color;
      }
      if (vehicle_model) {
        driver.vehicle_model = vehicle_model;
      }
      if (license_number) {
        driver.license_number = license_number;
      }
      if (id_card_number) {
        driver.id_card_number = id_card_number;
      }
      await context.update(Driver, driver_id, {
        id_card_image: driver.id_card_image,
        id_card_number: driver.id_card_number,
        license_image: driver.license_image,
        license_number: driver.license_number,
        vehicle_color: driver.vehicle_color,
        vehicle_model: driver.vehicle_model,
        vehicle_type: driver.vehicle_type,
        country_id: driver.country_id,
        city_id: driver.city_id,
        region_id: driver.region_id,
      });
      // return user
      return await context.findOne(Driver, {
        where: { id: driver_id },
        relations: {
          user: {
            wallet: true,
          },
          city: true,
          country: true,
          region: true,
        },
      });
    } catch (error) {
      throw new BadRequestException(
        this._config.get('app.env') !== 'prod'
          ? error
          : 'message.register_failed',
      );
    }
  }
}
