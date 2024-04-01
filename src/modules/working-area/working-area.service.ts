import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { WorkingArea } from 'src/infrastructure/entities/working-area/working-area.entity';
import { CreateWorkingAreaRequest } from './dto/requests/requests/create-working-area.request';
import { UpdateWorkingAreaRequest } from './dto/requests/requests/update-working-are.request';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from 'src/core/base/service/service.base';

@Injectable()
export class WorkingAreaService extends BaseService<WorkingArea> {
  constructor(
    @InjectRepository(WorkingArea)
    private readonly workingArea_repo: Repository<WorkingArea>,
  ) {
    super(workingArea_repo);
  }

  async createWorkingArea(req: CreateWorkingAreaRequest) {
    const workingArea = plainToInstance(WorkingArea, req);
    return await this.workingArea_repo.save(workingArea);
  }
  async updateWorkingArea(req: UpdateWorkingAreaRequest) {
    const workingArea = plainToInstance(WorkingArea, req);
    return await this.workingArea_repo.update(workingArea.id, workingArea);
  }
  async deleteWorkingArea(id: string) {
    return await this.workingArea_repo.softDelete(id);
  }

  async getWorkingArea() {
    return await this.workingArea_repo.find({relations: ["city"]});
  }
  async getSingleWorkingArea(id: string) {
    return await this.workingArea_repo.findOne({ where: { id: id },relations: ["city"] });
  }
}
