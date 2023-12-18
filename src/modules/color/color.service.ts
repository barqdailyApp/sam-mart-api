import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/core/base/service/service.base';
import { Color } from 'src/infrastructure/entities/color/color.entity';
import { Repository } from 'typeorm';
import { CreateColorRequest } from './dto/create-color.request';
import { UpdateColorRequest } from './dto/update-color.request';

@Injectable()
export class ColorService extends BaseService<Color> {
  constructor(
    @InjectRepository(Color)
    public colorRepository: Repository<Color>,
  ) {
    super(colorRepository);
  }
  async createColor(createColorRequest: CreateColorRequest): Promise<Color> {
    const create_color = this._repo.create(createColorRequest);
    const saved_color = await this._repo.save(create_color);
    return saved_color;
  }

  async updateColor(id: string, updateColorRequest: UpdateColorRequest) {
    await this.getSingleColor(id);
    await this._repo.update(id, updateColorRequest);
    return await this.getSingleColor(id);
  }

  async getSingleColor(id: string): Promise<Color> {
    const get_service = await this._repo.findOne({ where: { id } });
    if (!get_service) {
  throw new NotFoundException("message.color_not_found");
    }
    return get_service;
  }

  async getAllColors(): Promise<Color[]> {
    const all_services = await this._repo.find();
    return all_services;
  }

  async deleteColor(id: string) {
    await this.getSingleColor(id);
    return await this._repo.delete(id);
  }
}
