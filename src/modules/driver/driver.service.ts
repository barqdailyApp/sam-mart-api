import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Driver } from 'src/infrastructure/entities/driver/driver.entity';
import { Repository } from 'typeorm';
import { UpdateDriverLocationRequest } from './requests/update-driver-location.request';

@Injectable()
export class DriverService {
  constructor(
    @InjectRepository(Driver) private driverRepository: Repository<Driver>,
  ) {}

  async single(driver_id: string): Promise<Driver> {
    return await this.driverRepository.findOne({
      where: { id: driver_id },
      relations: { user: true },
    });
  }

  async all(): Promise<Driver[]> {
    return await this.driverRepository.find({ relations: { user: true } });
  }

  async updateDriverLocation(
    driver_id: string,
    updateDriverLocationRequest: UpdateDriverLocationRequest,
  ): Promise<void> {
    await this.driverRepository.update(
      { id: driver_id },
      updateDriverLocationRequest,
    );
  }
}
