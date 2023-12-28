import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Section } from 'src/infrastructure/entities/section/section.entity';
import { Any, In, Like, Repository } from 'typeorm';
import { Request } from 'express';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { User } from 'src/infrastructure/entities/user/user.entity';
import { SectionCategory } from 'src/infrastructure/entities/section/section-category.entity';
import { BaseService } from 'src/core/base/service/service.base';

@Injectable()
export class SectionService extends BaseService<Section> {
  constructor(
    @InjectRepository(Section)
    private readonly section_repo: Repository<Section>,
    @InjectRepository(User) private readonly user_repo: Repository<User>,
    @InjectRepository(SectionCategory) private readonly section_category_repo: Repository<SectionCategory>,
    
    @Inject(REQUEST) readonly request: Request,
  ) {super(section_repo);}

  async getSections(): Promise<Section[]> {

  

    return await this.section_repo.find(
      
    );
  }

  async getSectionCategories(section_id: string): Promise<SectionCategory[]> {
      return await this.section_category_repo.find({where:{section_id},relations:{category:true},order:{order_by:"ASC"}});
  }
}
