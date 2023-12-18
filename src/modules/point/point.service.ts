import { BadRequestException, Body, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Points } from 'src/infrastructure/entities/points/point.entity';
import { Repository } from 'typeorm';
import { SendToUsersRequest } from './dto/send-to-users.request';
import { User } from 'src/infrastructure/entities/user/user.entity';
import { BaseUserService } from 'src/core/base/service/user-service.base';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { Subscription } from 'rxjs';
import { AppConstants } from 'src/infrastructure/entities/app-constants/app-constants.entity';
import { PointsType } from 'src/infrastructure/data/enums/points-type.enum';
import { SubscriptionService } from '../subscription/subscription.service';
import { SubscriptionRequest } from '../subscription/dto/subscription-request';
import { Package } from 'src/infrastructure/entities/package/package.entity';

@Injectable()
export class PointService extends BaseUserService<Points> {
  constructor(
    // private readonly subscriptionService: SubscriptionService,
    @InjectRepository(Points)
    public pointRepository: Repository<Points>,
    @InjectRepository(User)
    public userRepository: Repository<User>,
    @InjectRepository(Package)
    public packageRepository: Repository<Package>,
    @InjectRepository(AppConstants)
    public appConstantsRepository: Repository<AppConstants>,

    @Inject(REQUEST) private readonly _request: Request,
  ) {
    super(pointRepository, _request);
  }
  async sendPoints(sendToUsersRequest: SendToUsersRequest) {
    const { points, users_id } = sendToUsersRequest;
     //* Check if user exists
    for (let index = 0; index < users_id.length; index++) {
      const user = await this.userRepository.findOne({
        where: { id: users_id[index] },
      });
      if (!user) {
        throw new NotFoundException(
          "message.user_not_found",
        );
      }
    }
     //* Add points and Update user points
    for (let index = 0; index < users_id.length; index++) {
      await this.pointRepository.save({ user_id: users_id[index], points });

      const point_user = await this.pointRepository
        .createQueryBuilder('point')
        .where('point.user_id = :user_id', { user_id: users_id[index] })
        .select('SUM(point.points)', 'total')
        .getRawOne();
      const user = await this.userRepository.findOne({
        where: { id: users_id[index] },
      });
      user.total_points = point_user.total;
      await this.userRepository.save(user);
    }
  }
  
  async redeem(){
    const total_points = await this.getUserPoints();
const redeemPoints= (await this.pointsMetaData()).redeemable_points;


if(total_points["count"]< redeemPoints ){

 throw new BadRequestException("message.insufficient_points")  }
const first_package= await this.packageRepository.findOneBy({order_by:0})
const points= new Points({user_id:super.currentUser.id,points:(-1*redeemPoints),type:PointsType.REDEEM})  
this.pointRepository.save(points)
return first_package;
  }

  async getPointsData() {

const userPoints=(await this.getUserPoints())["count"]==null?0:(await this.getUserPoints())["count"];
const  redeemPoints=(await this.pointsMetaData()).redeemable_points;
const first_package= await this.packageRepository.findOneBy({order_by:0})
console.log(userPoints)
return { userPoints,redeemPoints,first_package}
  }

  async pointsMetaData(){
    const app_constants = await this.appConstantsRepository
    .createQueryBuilder('app-constants')
    .getOne();
    return app_constants;
  }

  async getUserPoints(){
 return    await this.pointRepository.createQueryBuilder('points')
    .where('points.user_id = :id', { id: super.currentUser.id })
    .select('SUM(points.points)', 'count')
    .getRawOne();
  }

  
}

