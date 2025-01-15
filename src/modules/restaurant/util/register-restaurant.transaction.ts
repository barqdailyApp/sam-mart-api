import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import * as uuidv4 from 'uuid';
import { RegisterRestaurantRequest } from '../dto/requests/register-restaurant.request';
import { REQUEST } from '@nestjs/core';
import { Order } from 'sequelize';
import { BaseTransaction } from 'src/core/base/database/base.transaction';
import { OrderGateway } from 'src/integration/gateways/order.gateway';
import { NotificationService } from 'src/modules/notification/notification.service';
import { PaymentMethodService } from 'src/modules/payment_method/payment_method.service';
import { PromoCodeService } from 'src/modules/promo-code/promo-code.service';
import { TransactionService } from 'src/modules/transaction/transaction.service';
import { DataSource, EntityManager, In } from 'typeorm';
import { Request } from 'express';
import { Restaurant } from 'src/infrastructure/entities/restaurant/restaurant.entity';
import { plainToInstance } from 'class-transformer';
import { User } from 'src/infrastructure/entities/user/user.entity';
import * as fs from 'fs';
import { RestaurantAttachment } from 'src/infrastructure/entities/restaurant/restaurant-attachment.entity';
import { RestaurantAttachmentEnum } from 'src/infrastructure/data/enums/restaurant-attachment.enum';
import { CuisineType } from 'src/infrastructure/entities/restaurant/cuisine-type.entity';
import { FileService } from 'src/modules/file/file.service';
import { RestaurantAdmin } from 'src/infrastructure/entities/restaurant/restaurant-admin.entity';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import * as bcrypt from 'bcrypt';
import { randStr } from 'src/core/helpers/cast.helper';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class RegisterRestaurantTransaction extends BaseTransaction<
  RegisterRestaurantRequest,
  Restaurant
> {
  constructor(
    dataSource: DataSource,
    @Inject(REQUEST) readonly request: Request,
    private readonly fileService: FileService,
    @Inject(ConfigService) private readonly _config: ConfigService,
  ) {
    super(dataSource);
  }

  // the important thing here is to use the manager that we've created in the base class
  protected async execute(
    req: RegisterRestaurantRequest,
    context: EntityManager,
  ): Promise<Restaurant> {
    try {
      const restaurant = plainToInstance(Restaurant, req);
      const user = new User({
        phone: req.phone,
        email: req.email,
        username: req.phone,
        name: req.user_name,
        password: await bcrypt.hash(
        req.password+ this._config.get('app.key'),
          10,
        ),
      
        roles: [Role.RESTAURANT_ADMIN],
      });
      if(!req.logo.includes('http')) {
        //check directory
        if (!fs.existsSync('storage/restaurant-logos')) {
          fs.mkdirSync('storage/restaurant-logos');
        }
        const logo = req.logo.replace('/tmp/', '/restaurant-logos/');
        fs.renameSync(req.logo, logo);
        req.logo = logo;
      }
      if(!req.image.includes('http')) {
        //check directory
        if (!fs.existsSync('storage/restaurant-images')) {
          fs.mkdirSync('storage/restaurant-images');
        }
        const image = req.image.replace('/tmp/', '/restaurant-images/');
        fs.renameSync(req.image, image);
        req.image = image;
      }
      const menus = req.menu.map((image) => {
        if (!fs.existsSync('storage/restaurant-menus')) {
          fs.mkdirSync('storage/restaurant-menus');
        }
        // store the future path of the image
        const newPath = image.replace('/tmp/', '/restaurant-menus/');
        fs.renameSync(image, newPath);
        return new RestaurantAttachment({
          url: newPath,
          restaurant: restaurant,
          type: RestaurantAttachmentEnum.MENU,
        });
      });
      const licenses = req.licenses.map((image) => {
        if (!fs.existsSync('storage/restaurant-licenses')) {
          fs.mkdirSync('storage/restaurant-licenses');
        }
        // store the future path of the image
        const newPath = image.replace('/tmp/', '/restaurant-licenses/');
        fs.renameSync(image, newPath);
        return new RestaurantAttachment({
          restaurant: restaurant,
          url: newPath,
          type: RestaurantAttachmentEnum.LICENSE,
        });
      });

      const cuisine_types = await context.find(CuisineType, {
        where: { is_active: true, id: In(req.cuisines_types_ids) },
      });
      if (!cuisine_types)
        throw new BadRequestException('cuisine types not found');
      restaurant.cuisine_types = cuisine_types;
      await context.save(restaurant);
      await context.save(menus);
      await context.save(licenses);
      await context.save(user);
      await context.save(
        new RestaurantAdmin({ user: user, restaurant: restaurant }),
      );
      return restaurant;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
