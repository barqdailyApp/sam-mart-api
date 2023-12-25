import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MeasurementUnit } from 'src/infrastructure/entities/product/measurement-unit.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { CreateMeasurementUnitRequest } from './dto/requests/create-measurement-unit.request';
import { UpdateMeasurementUnitRequest } from './dto/requests/update-measurement-unit.request';

@Injectable()
export class MeasurementUnitService {
  constructor(
    @InjectRepository(MeasurementUnit)
    private measurementUnitRepository: Repository<MeasurementUnit>,
  ) {}
  async create(
    createMeasurementUnitRequest: CreateMeasurementUnitRequest,
  ): Promise<MeasurementUnit> {
    const measurementUnit = this.measurementUnitRepository.create(
      createMeasurementUnitRequest,
    );
    return await this.measurementUnitRepository.save(measurementUnit);
  }

  async findAll(): Promise<MeasurementUnit[]> {
    return await this.measurementUnitRepository.find({});
  }
  async single(measurement_unit_id: string): Promise<MeasurementUnit> {
    const measurementUnit = await this.measurementUnitRepository.findOne({
      where: { id: measurement_unit_id },
    });
    if (!measurementUnit) {
      throw new NotFoundException('Measurement Unit not found');
    }
    return measurementUnit;
  }
  async update(
    measurement_unit_id: string,
    updateMeasurementUnitRequest: UpdateMeasurementUnitRequest,
  ): Promise<UpdateResult> {
    await this.single(measurement_unit_id);

    return await this.measurementUnitRepository.update(
      { id: measurement_unit_id },
      updateMeasurementUnitRequest,
    );
  }

  async delete(measurement_unit_id: string): Promise<DeleteResult> {
    await this.single(measurement_unit_id);
    return await this.measurementUnitRepository.delete({
      id: measurement_unit_id,
    });
  }
}
