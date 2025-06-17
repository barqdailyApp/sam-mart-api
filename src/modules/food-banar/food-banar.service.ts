import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/core/base/service/service.base';
import { Brackets, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { Banar } from 'src/infrastructure/entities/banar/banar.entity';
import { CreateFoodBanarRequest } from './dto/request/create-food-banar.request';
import { FileService } from '../file/file.service';

import { UpdateFoodBannerRequest } from './dto/request/update-food-banner.request';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { User } from 'src/infrastructure/entities/user/user.entity';
import { PaginatedRequest } from 'src/core/base/requests/paginated.request';

import { GetNearResturantsQuery } from '../restaurant/dto/requests/get-near-resturants.query';
import { FoodBanar } from 'src/infrastructure/entities/restaurant/banar/food_banar.entity';
import { Constant } from 'src/infrastructure/entities/constant/constant.entity';
import { ConstantType } from 'src/infrastructure/data/enums/constant-type.enum';
import { or } from 'sequelize';

@Injectable()
export class BanarService extends BaseService<FoodBanar> {
  constructor(
    @InjectRepository(FoodBanar)
    private readonly banarRepository: Repository<FoodBanar>,
    @Inject(FileService) private _fileService: FileService,
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(Constant) private readonly constantRepository: Repository<Constant>,
  ) {
    super(banarRepository);
  }

  async createBanar(banar: CreateFoodBanarRequest) {
    const tempImage = await this._fileService.upload(
      banar.banar,
      `food-banars`,
    );

    let createdBanar = this.banarRepository.create({
      banar: tempImage,
      started_at: banar.started_at,
      ended_at: banar.ended_at,
      is_active: banar.is_active,
      is_popup: banar?.is_popup,
      restaurant_id: banar?.restaurant_id,
      order_by: banar?.order_by,
    });

    return await this.banarRepository.save(createdBanar);
  }

  async getGuestBanars(query: GetNearResturantsQuery) {
    const currentDate = new Date();
  
    const banars = await this.banarRepository
      .createQueryBuilder('food_banar')
      .leftJoinAndSelect('food_banar.restaurant', 'restaurant')
      .addSelect(`
        6371 * acos(
          cos(radians(:latitude)) * cos(radians(COALESCE(restaurant.latitude, 0))) *
          cos(radians(COALESCE(restaurant.longitude, 0)) - radians(:longitude)) +
          sin(radians(:latitude)) * sin(radians(COALESCE(restaurant.latitude, 0)))
        )
      `, 'distance')
      .where('food_banar.is_active = :is_active', { is_active: true })
      .andWhere('food_banar.started_at <= :started_at', { started_at: currentDate })
      .andWhere('food_banar.ended_at >= :ended_at', { ended_at: currentDate })
      .andWhere('food_banar.is_popup = :is_popup', { is_popup: false })
      .andWhere(
        new Brackets((qb) => {
          qb.where(
            `(6371 * acos(
              cos(radians(:latitude)) * cos(radians(COALESCE(restaurant.latitude, 0))) *
              cos(radians(COALESCE(restaurant.longitude, 0)) - radians(:longitude)) +
              sin(radians(:latitude)) * sin(radians(COALESCE(restaurant.latitude, 0)))
            )) <= :radius`,
            {
              latitude: query.latitude,
              longitude: query.longitude,
              radius: query.radius,
            }
          ).orWhere('restaurant.id IS NULL');
        }),
      )
      .andWhere('restaurant.status = :status OR restaurant.id IS NULL', { status: 'ACTIVE' })
      .setParameters({
        latitude: query.latitude,
        longitude: query.longitude,
      })
      .orderBy('food_banar.order_by', 'ASC')
      .getRawAndEntities();
  
    // Get delivery time per km
    const deliveryTimePerKmConstant = await this.constantRepository.findOne({
      where: { type: ConstantType.DELIVERY_TIME_PER_KM },
    });
    
    const deliveryTimePerKm = deliveryTimePerKmConstant
      ? Number(deliveryTimePerKmConstant?.variable)
      : 0;
  
    // Attach the distance and estimated time to each result
    const banarsWithDistance = banars.entities.map((banar, index) => {
      const raw = banars.raw[index];
      const rawDistance = parseFloat(raw.distance);
      const averagePrepTime = Number(banar?.restaurant?.average_prep_time || 0);
  
      return {
        ...banar,
        restaurant: banar.restaurant == null
          ? null
          : {
              ...banar.restaurant,
              distance: rawDistance,
              estimated_delivery_time: averagePrepTime + (deliveryTimePerKm * rawDistance),
            },
      };
    });
  
    return banarsWithDistance;
  }
  
  
  async getGuestPopup() {
    return await this.banarRepository.findOne({
      where: {
        is_active: true,
        started_at: LessThanOrEqual(new Date()),
        ended_at: MoreThanOrEqual(new Date()),
        is_popup: true,
      },
      order: {
        order_by: 'ASC',}
    });
  }

  async updateBanar(id: string, banar: UpdateFoodBannerRequest) {
    let tempImage = null;
    const banarEntity = await this.banarRepository.findOne({ where: { id } });
    if (!banarEntity) {
      throw new NotFoundException('message.banner_not_found');
    }

    if (banar.banar) {
      tempImage = await this._fileService.upload(banar.banar, `food-banars`);
    }

    Object.assign(banarEntity, {
      banar: banar.banar ? tempImage : banarEntity.banar,
      started_at: banar.started_at ? banar.started_at : banarEntity.started_at,
      ended_at: banar.ended_at ? banar.ended_at : banarEntity.ended_at,
      is_active:
        banar.is_active != null ? banar.is_active : banarEntity.is_active,
      restaurant_id: banar?.restaurant_id,
      order_by: banar?.order_by,
      
    });

    return await this.banarRepository.save(banarEntity);
  }

  async deleteBanar(id: string) {
    const banar = await this.banarRepository.findOne({ where: { id } });
    if (!banar) {
      throw new NotFoundException('message.banner_not_found');
    }
    return await this.banarRepository.remove(banar);
  }

  get currentUser(): User {
    return this.request.user;
  }
}
