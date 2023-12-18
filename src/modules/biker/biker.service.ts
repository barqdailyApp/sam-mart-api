import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Biker } from 'src/infrastructure/entities/biker/biker.entity';
import { Between, Repository } from 'typeorm';
import { Request } from 'express';
import { UpdateUserLocationRequest } from './dto/requests/update-user-location.request';
import { Order } from 'src/infrastructure/entities/order/order.entity';
import { OrderDetails } from 'src/infrastructure/entities/order/order-details';
import { OrderStatus } from 'src/infrastructure/data/enums/order-status.enum';
import { BikerFilterRequest } from './dto/requests/biker-filter.request';
import { User } from 'src/infrastructure/entities/user/user.entity';
import { Points } from 'src/infrastructure/entities/points/point.entity';
import { UpdateBikerRequest } from './dto/requests/biker-update.request';
import { FileService } from '../file/file.service';
import { UploadFileRequest } from '../file/dto/requests/upload-file.request';
import { BaseService } from 'src/core/base/service/service.base';
import { NotificationEntity } from 'src/infrastructure/entities/notification/notification.entity';
@Injectable()
export class BikerService extends BaseService<Biker> {
  constructor(
    @Inject(REQUEST) private readonly _request: Request,
    @InjectRepository(Biker) private readonly biker_repo: Repository<Biker>,
    @InjectRepository(User) private readonly user_repo: Repository<User>,
    @InjectRepository(NotificationEntity)
    private readonly notificationRepo: Repository<NotificationEntity>,

    @InjectRepository(Order) private readonly order_repo: Repository<Order>,
    @InjectRepository(Points)
    private readonly point_repo: Repository<Points>,
    @Inject(FileService) private _fileService: FileService,
  ) {
    super(biker_repo);
  }
  async getBiker() {
    return await this.biker_repo.findOneBy({
      user_id: this._request.user.id,
    });
  }
  async getBikerProfile() {
    const currentDate = new Date();
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1,
    );
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
    );
// Convert to local time zone
    startOfMonth.setHours(0, 0, 0, 0);
    endOfMonth.setHours(23, 59, 59, 999);
    const [
      biker,
      total_point_current_month,
      total_order_current_month,
      total_notification,
    ] = await Promise.all([
      this.biker_repo
        .createQueryBuilder('biker')
        .where('biker.user_id = :userId', { userId: this._request.user.id })
        .leftJoinAndSelect('biker.user', 'user')
        .getOne(),

      this.biker_repo
        .createQueryBuilder('biker')
        .where('biker.user_id = :userId', { userId: this._request.user.id })
        .leftJoinAndSelect('biker.user', 'user')
        .leftJoinAndSelect(
          'user.points',
          'points',
          'points.created_at >= :startDate AND points.created_at <= :endDate',
          { startDate: startOfMonth, endDate: endOfMonth },
        )
        .select('SUM(points.points)', 'total')
        .getRawOne(),

      this.order_repo
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.biker', 'biker')

        .where('biker.user_id = :userId', { userId: this._request.user.id })
        .andWhere('order.created_at >= :startDate', {
          startDate: startOfMonth,
        })
        .andWhere('order.created_at <= :endDate', { endDate: endOfMonth })
        .andWhere('order.status = :status', { status: OrderStatus.COMPLETED })

        .getCount(),
      this.notificationRepo
        .createQueryBuilder('notification')
        .where('notification.user_id = :id', { id: this._request.user.id })
        .andWhere('notification.is_read = :is_read', { is_read: false })
        .getCount(),
    ]);
    return {
      biker,
      total_point_current_month: Number(total_point_current_month.total),
      total_order_current_month,
      total_notification,
    };
  }

  async getBikerOrders(bikerFilterRequest: BikerFilterRequest) {
    const { limit, page } = bikerFilterRequest;
    const skip = (page - 1) * limit;
    const currentDate = new Date();
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1,
    );
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
    );
    // Convert to local time zone
    startOfMonth.setHours(0, 0, 0, 0);
    endOfMonth.setHours(23, 59, 59, 999);
    const [orders, total] = await Promise.all([
      this.order_repo
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.biker', 'biker')
        .leftJoinAndSelect('biker.user', 'user')

        .leftJoinAndSelect('order.address', 'address')
        .leftJoinAndSelect('order.customer', 'customer')
        .leftJoinAndSelect('customer.user', 'user_customer')

        .where('biker.user_id = :userId', { userId: this._request.user.id })
        .andWhere('order.created_at >= :startDate', { startDate: startOfMonth })
        .andWhere('order.created_at <= :endDate', { endDate: endOfMonth })
        .andWhere('order.status = :status', { status: OrderStatus.COMPLETED })
        .skip(skip)
        .take(limit)
        .getMany(),
      this.order_repo
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.biker', 'biker')

        .where('biker.user_id = :userId', { userId: this._request.user.id })
        .andWhere('order.created_at >= :startDate', { startDate: startOfMonth })
        .andWhere('order.created_at <= :endDate', { endDate: endOfMonth })
        .andWhere('order.status = :status', { status: OrderStatus.COMPLETED })

        .getCount(),
    ]);

    return { orders, total };
  }
  async getBikerPoints(bikerFilterRequest: BikerFilterRequest) {
    // const { limit, page } = bikerFilterRequest;
    // const skip = (page - 1) * limit;
    const currentDate = new Date();
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1,
    );
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
    );
// Convert to local time zone
    startOfMonth.setHours(0, 0, 0, 0);
    endOfMonth.setHours(23, 59, 59, 999);
    // const [points, total] = await Promise.all([
    //   this.point_repo
    //     .createQueryBuilder('point')
    //     .where('point.user_id = :user_id', { user_id: this._request.user.id })
    //     .andWhere('point.created_at >= :startDate', { startDate: startOfMonth })
    //     .andWhere('point.created_at <= :endDate', { endDate: endOfMonth })
    //     .skip(skip)
    //     .take(limit)
    //     .getMany(),

    // ]);

    const CurrentMonthDays = this.getCurrentMonthDays();

    const total_points_in_month = await this.point_repo
      .createQueryBuilder('point').withDeleted()
      .where('point.user_id = :user_id', { user_id: this._request.user.id })
      .andWhere('point.created_at >= :startDate', { startDate: startOfMonth })
      .andWhere('point.created_at <= :endDate', { endDate: endOfMonth })
      .select('SUM(point.points)', 'total')
      .getRawOne();

    const points_orders = {
      total_points_in_month: total_points_in_month.total ?? 0,
      points:[]
    };
   

    for (let index = 0; index < CurrentMonthDays.length; index++) {
      const currentDate = CurrentMonthDays[index];
      const startOfDay = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate(),
        0,
        0,
        0,
      );
      const endOfDay = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate(),
        23,
        59,
        59,
      );
      const points = await this.point_repo
        .createQueryBuilder('point')
        .where('point.user_id = :user_id', { user_id: this._request.user.id })
        .andWhere('point.created_at >= :startOfDay', { startOfDay })
        .andWhere('point.created_at <= :endOfDay', { endOfDay })
        .select('SUM(point.points)', 'total')
        .getRawOne();

      const orders = await this.order_repo
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.biker', 'biker')

        .where('biker.user_id = :userId', { userId: this._request.user.id })
        .andWhere('order.created_at >= :startOfDay', { startOfDay })
        .andWhere('order.created_at <= :endOfDay', { endOfDay })
        .andWhere('order.status = :status', { status: OrderStatus.COMPLETED })

        .getCount();

      points_orders.points.push({
        date: currentDate,
        total_points:Number(points.total)  ?? 0,
        total_orders: orders,
      });
    }

    return points_orders;
  }
  getCurrentMonthDays(): Date[] {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0,
    );

    const days = [];
    for (
      let currentDate = firstDayOfMonth;
      currentDate <= lastDayOfMonth;
      currentDate.setDate(currentDate.getDate() + 1)
    ) {
      days.push(new Date(currentDate));
    }

    return days;
  }
  async updateUserLocation(req: UpdateUserLocationRequest) {
    const biker = await this.getBiker();

    biker.latitude = req.latitude;
    biker.longitude = req.longitude;

    return await this.biker_repo.save(biker);
  }

  async activeBiker(isActive: boolean, id: string) {
    const biker = await this.biker_repo.findOneBy({
      id,
    });
    if (!biker) {
      throw new NotFoundException('message.biker_not_found');
    }
    console.log('is_active', isActive);
    biker.is_active = isActive;
    return await biker.save();
  }
  async getAllBikers(bikerFilterRequest: BikerFilterRequest) {
    const { limit, page } = bikerFilterRequest;
    const skip = (page - 1) * limit;
    return await this.biker_repo.find({
      skip,
      take: limit,
      relations: { user: true },
    });
  }

  async updateBikerProfile(updateBikerRequest: UpdateBikerRequest, id: string) {
    const { email, file, first_name, last_name, phone } = updateBikerRequest;
    const user = await this.user_repo.findOne({
      where: {
        id,
      },
    });
    if (!user) {
      throw new NotFoundException('message.user_not_found');
    }

    const uploadFileRequest = new UploadFileRequest();
    uploadFileRequest.file = file;
    if (uploadFileRequest.file) {
      const tempImage = await this._fileService.upload(
        uploadFileRequest,
        'avatars',
      );

      if (user.avatar) {
        await this._fileService.delete(user.avatar);
        await this.user_repo.update(id, {
          avatar: tempImage,
          email: email == '' ? user.email : email,
          first_name: first_name == '' ? user.first_name : first_name,
          last_name: last_name == '' ? user.last_name : last_name,
          phone: phone == '' ? user.phone : phone,
        });
      }
    } else {
      await this.user_repo.update(id, {
        email: email == '' ? user.email : email,
        first_name: first_name == '' ? user.first_name : first_name,
        last_name: last_name == '' ? user.last_name : last_name,
        phone: phone == '' ? user.phone : phone,
      });
    }
  }
}
