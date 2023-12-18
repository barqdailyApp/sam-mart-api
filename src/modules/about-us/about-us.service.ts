import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AboutUs } from 'src/infrastructure/entities/about-us/about-us.entity';
import { Repository } from 'typeorm';
import { UpdateAboutUsRequest } from './dto/update-aboutus.request';

@Injectable()
export class AboutUsService {
  constructor(
    @InjectRepository(AboutUs)
    private _repo: Repository<AboutUs>,
  ) {}

  async getAboutUs(): Promise<AboutUs> {
    return await this._repo.createQueryBuilder('aboutUs').getOne();
  }
  async updateAboutUs(
    updateAboutUsRequest: UpdateAboutUsRequest,
  ): Promise<AboutUs> {
    const aboutUs: AboutUs = await this._repo
      .createQueryBuilder('aboutUs')
      .getOne();

    await this._repo.update(aboutUs.id, updateAboutUsRequest);
    return await this.getAboutUs();
  }
}
