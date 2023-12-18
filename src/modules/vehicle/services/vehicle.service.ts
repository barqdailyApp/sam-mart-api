import { ForbiddenException, Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { CreateVehicleTransaction } from '../utils/transactions/create-vehicle.transaction';
import { UpdateVehicleTransaction } from '../utils/transactions/update-vehicle.transaction';
import { Repository } from 'typeorm';
import { CreateVehicleRequest } from '../dto/requests/create-vehicle.request';
import { UpdateVehicleRequest } from '../dto/requests/update-vehicle.request';
import { EntityManager } from 'typeorm/entity-manager/EntityManager';
// import { DeleteVehicleTransaction } from '../utils/transactions/delete-vehicle.transaction';
import { Vehicle } from 'src/infrastructure/entities/vehicle/vehicle.entity';
import { BaseService } from 'src/core/base/service/service.base';
import { Customer } from 'src/infrastructure/entities/customer/customer.entity';
import { DeleteVehicleTransaction } from '../utils/transactions/delete-vehicle.transaction';

@Injectable({ scope: Scope.REQUEST })
export class VehicleService extends BaseService<Vehicle> {
  constructor(
    @InjectRepository(Vehicle)
    public _repo: Repository<Vehicle>,
    @InjectRepository(Customer)
    public customer_repo: Repository<Customer>,
    @Inject(REQUEST) public request: Request,
    @Inject(CreateVehicleTransaction)
    private readonly createVehicleTransaction: CreateVehicleTransaction,
    private readonly updateVehicleTransaction: UpdateVehicleTransaction,
    private readonly deleteVehicleTransaction: DeleteVehicleTransaction,
    private context: EntityManager, // TODO: remove after testing
  ) {
    super(_repo);
  }

  async getDefaultVehicles(): Promise<Vehicle[]> {
    const customer = await this.customer_repo.findOneBy({
      user_id: this.request.user.id,
    });
    if (!customer) throw new NotFoundException("message.customer_not_found");

    // find the first active vehicle
    const vehicle = await this._repo.find({
      relations: ['brand', 'brand_model','color'],
      where: {
        customer_id: customer.id,
        deleted_at: null,
      },
      order: { created_at: 'DESC' },
    });

    // return the vehicle
    return vehicle;
  }
  async getSingleVehicle(id: string): Promise<Vehicle> {
    // find the first active vehicle
    const vehicle = await this._repo.findOne({
      relations: ['brand', 'brand_model', 'color'],
      where: {
        id: id,
      },
      order: { created_at: 'DESC' },
    });

    // return the vehicle
    return vehicle;
  }

  async createVehicle(req: CreateVehicleRequest): Promise<Vehicle> {
    const vehicle = await this.createVehicleTransaction.run(req);
    return vehicle;
  }

  async updateVehicle(req: UpdateVehicleRequest): Promise<Vehicle> {
    const vehicle = await this.updateVehicleTransaction.run(req);
    return vehicle;
  }

  async deleteVehicle(vehicle_id: string): Promise<Vehicle> {
    const vehicle = await this.deleteVehicleTransaction.run(vehicle_id);
    return vehicle;
  }
}
