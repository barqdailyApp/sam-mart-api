import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { WorkingArea } from 'src/infrastructure/entities/working-area/working-area.entity';
import { CreateWorkingAreaRequest } from './dto/requests/requests/create-working-area.request';
import { UpdateWorkingAreaRequest } from './dto/requests/requests/update-working-are.request';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class WorkingAreaService {
  constructor(
    @InjectRepository(WorkingArea)
    private readonly workingArea_repo: Repository<WorkingArea>,
  ) {}

  async createWorkingArea(req: CreateWorkingAreaRequest) {
    const workingArea = plainToInstance(WorkingArea, req);
    return await this.workingArea_repo.save(workingArea);
  }
  async updateWorkingArea(req: UpdateWorkingAreaRequest) {
    const workingArea = plainToInstance(WorkingArea, req);
    return await this.workingArea_repo.update(workingArea.id, workingArea);
  }
  async deleteWorkingArea(id: string) {
    return await this.workingArea_repo.delete(id);
  }

  async getWorkingArea() {
    return await this.workingArea_repo.find({relations: ["city"]});
  }
  async getSingleWorkingArea(id: string) {
    return await this.workingArea_repo.findOne({ where: { id: id },relations: ["city"] });
  }
}
