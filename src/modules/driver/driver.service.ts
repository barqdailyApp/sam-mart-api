import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Driver } from 'src/infrastructure/entities/driver/driver.entity';
import { In, Not, Repository, UpdateResult } from 'typeorm';
import { UpdateDriverLocationRequest } from './requests/update-driver-location.request';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { UpdateDriverReceiveOrdersRequest } from './requests/update-driver-receive-orders';
import { DriverShipmentGateway } from 'src/integration/gateways/driver-shipment.gateway';
import { Gateways } from 'src/core/base/gateways';
import { Shipment } from 'src/infrastructure/entities/order/shipment.entity';
import { ShipmentStatusEnum } from 'src/infrastructure/data/enums/shipment_status.enum';
import { ShipmentDriverResponse } from '../order/dto/response/driver-response/shipment-driver.respnse';
import { plainToClass } from 'class-transformer';
import { I18nResponse } from 'src/core/helpers/i18n.helper';
import { DriversDashboardQuery } from './filters/driver-dashboard.query';
import { DriverStatus } from 'src/infrastructure/data/enums/driver-status.enum';
import { DriverStatusRequest } from './requests/update-driver-status.request';
import { DeleteDriverAccountTransaction } from './transactions/delete-driver-account.transaction';
import { UpdateProfileDriverRequest } from './requests/update-profile-driver.request';
import { UpdateProfileDriverTransaction } from './transactions/update-profile-driver.transaction';
@Injectable()
export class DriverService {
  constructor(
    @InjectRepository(Driver) private driverRepository: Repository<Driver>,
    @Inject(REQUEST) private readonly _request: Request,
    @Inject(DriverShipmentGateway)
    private driverShipmentGateway: DriverShipmentGateway,
    @InjectRepository(Shipment)
    private shipmentRepository: Repository<Shipment>,
    @Inject(I18nResponse) private readonly _i18nResponse: I18nResponse,
    private readonly deleteAccountTransaction: DeleteDriverAccountTransaction,
    @Inject(UpdateProfileDriverTransaction)
    private readonly updateProfileDriverTransaction: UpdateProfileDriverTransaction,
  ) {}

  async single(): Promise<Driver> {
    const driver = await this.driverRepository.findOne({
      where: { user_id: this._request.user.id },
      relations: { user: true },
    });

    if (!driver) {
      throw new Error('message.driver_not_found');
    }
    return driver;
  }

  async myProfileDriver(): Promise<Driver> {
    const driver = await this.driverRepository.findOne({
      where: { user_id: this._request.user.id },
      relations: { user: true },
    });

    if (!driver) {
      throw new Error('message.driver_not_found');
    }
    return driver;
  }

  async all(warehouse_id?: string): Promise<Driver[]> {
    const dbQuery = {
      relations: { user: true },
    };

    if (warehouse_id) {
      dbQuery['where'] = { warehouse_id };
    }

    return await this.driverRepository.find(dbQuery);
  }

  async updateDriverLocation(
    updateDriverLocationRequest: UpdateDriverLocationRequest,
  ): Promise<UpdateResult> {
    const { latitude, longitude } = updateDriverLocationRequest;
    const update = await this.driverRepository.update(
      { user_id: this._request.user.id },
      {
        latitude,
        longitude,
      },
    );
    const driver_shipments = await this.shipmentRepository.find({
      where: {
        driver: {
          user_id: this._request.user.id,
        },
        status: Not(
          In([
            ShipmentStatusEnum.PENDING,
            ShipmentStatusEnum.DELIVERED,
            ShipmentStatusEnum.CANCELED,
          ]),
        ),
      },
      relations: {
        driver: true,
        order: true,
      },
    });
    this.driverShipmentGateway.broadcastLocationDriver(driver_shipments);
    return update;
  }

  async updateDriverStatus(
    updateDriverReceiveOrdersRequest: UpdateDriverReceiveOrdersRequest,
  ): Promise<Driver> {
    const driver = await this.driverRepository.findOne({
      where: { user_id: this._request.user.id },
      relations: { user: true },
    });

    if (!driver) {
      throw new Error('message.driver_not_found');
    }
    await this.driverRepository.update(
      { id: driver.id },
      { is_receive_orders: updateDriverReceiveOrdersRequest.is_receive_orders },
    );

    return await this.driverRepository.findOne({
      where: { user_id: this._request.user.id },
      relations: { user: true },
    });
  }
  async updateProfileDriver(
    updateProfileDriverRequest: UpdateProfileDriverRequest,
  ) {
    return await this.updateProfileDriverTransaction.run(
      updateProfileDriverRequest,
    );
  }

  async allDriversDashboard(driversDashboardQuery: DriversDashboardQuery) {
    const {
      created_at,
      driver_search,
      limit,
      page,
      status,
      city_id,
      country_id,
      region_id,
      vehicle_type,
    } = driversDashboardQuery;
    const skip = (page - 1) * limit;

    let query = this.driverRepository
      .createQueryBuilder('driver')
      .leftJoinAndSelect('driver.warehouse', 'warehouse')

      .leftJoinAndSelect('driver.user', 'user')

      .leftJoinAndSelect('user.wallet', 'wallet')

      .leftJoinAndSelect('driver.country', 'country')
      .leftJoinAndSelect('driver.city', 'city')
      .leftJoinAndSelect('driver.region', 'region')
      .skip(skip)
      .take(limit);

    // if (created_at) {
    //   query = query.andWhere('driver.created_at = :created_at', {
    //     created_at,
    //   });
    // }
    if (created_at) {
      //*using database functions to truncate the time part of the order.created_at timestamp to compare only the date components
      query = query.where('DATE(driver.created_at) = :created_at', {
        created_at,
      });
    }
    if (driver_search) {
      query = query.andWhere(
        '(user.name LIKE :driver_search OR user.phone LIKE :driver_search OR user.email LIKE :driver_search)',
        { driver_search: `%${driver_search}%` },
      );
    }
    if (status) {
      query = query.andWhere('driver.status = :status', {
        status,
      });
    }
    if (country_id) {
      query = query.andWhere('driver.country_id = :country_id', {
        country_id,
      });
    }
    if (city_id) {
      query = query.andWhere('driver.city_id = :city_id', {
        city_id,
      });
    }
    if (region_id) {
      query = query.andWhere('driver.region_id = :region_id', {
        region_id,
      });
    }
    if (vehicle_type) {
      query = query.andWhere('driver.vehicle_type LIKE :vehicle_type', {
        vehicle_type: `%${vehicle_type}%`,
      });
    }

    const [drivers, total] = await query.getManyAndCount();
    return {
      drivers,
      total,
    };
  }
  async singleDriverDashboard(driver_id: string) {
    const driver = await this.driverRepository.findOne({
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
    if (!driver) {
      throw new Error('message.driver_not_found');
    }
    return driver;
  }
  async totalDriverDashboard() {
    const total = await this.driverRepository.count();
    const totalPending = await this.driverRepository.count({
      where: {
        status: DriverStatus.PENDING,
      },
    });
    const totalVerified = await this.driverRepository.count({
      where: {
        status: DriverStatus.VERIFIED,
      },
    });
    const totalBlocked = await this.driverRepository.count({
      where: {
        status: DriverStatus.BLOCKED,
      },
    });
    return {
      total,
      totalPending,
      totalVerified,
      totalBlocked,
    };
  }

  //changeDriverStatusDashboard

  async deleteDriverDashboard(driver_id: string) {
    return await this.deleteAccountTransaction.run({ driver_id });
  }
}
