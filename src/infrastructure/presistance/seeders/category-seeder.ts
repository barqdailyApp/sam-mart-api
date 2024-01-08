import { Injectable } from '@nestjs/common';
import { Seeder, DataFactory } from 'nestjs-seeder';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/infrastructure/entities/user/user.entity';
import { Address } from 'src/infrastructure/entities/user/address.entity';
import { Country } from 'src/infrastructure/entities/country/country.entity';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { City } from 'src/infrastructure/entities/city/city.entity';
import { Region } from 'src/infrastructure/entities/region/region.entity';
import { Category } from 'src/infrastructure/entities/category/category.entity';
import { Subcategory } from 'src/infrastructure/entities/category/subcategory.entity';
import { Section } from 'src/infrastructure/entities/section/section.entity';
import { CategorySubCategory } from 'src/infrastructure/entities/category/category-subcategory.entity';
import { SectionCategory } from 'src/infrastructure/entities/section/section-category.entity';

@Injectable()
export class CategorySeeder implements Seeder {
  constructor(
    @InjectRepository(Category)
    private readonly category_repo: Repository<Category>,
    @InjectRepository(Subcategory)
    private readonly subcategory_repo: Repository<Subcategory>,
    @InjectRepository(CategorySubCategory)
    private readonly categorySubCategory: Repository<CategorySubCategory>,
    @InjectRepository(Section)
    private readonly section_repo: Repository<Section>,
    @InjectRepository(SectionCategory)
    private readonly section_category_repo: Repository<SectionCategory>,
  ) {}

  async seed(): Promise<any> {
    const sections_data = fs.readFileSync('./json/sections.json', 'utf8');
    const section_Object: Section[] = JSON.parse(sections_data);
    console.log(section_Object);
    for (const section of section_Object) {
      const sectionCreated = this.section_repo.create({
        name_ar: section.name_ar,
        name_en: section.name_en,
        logo:section.logo,
        order_by: section.order_by,
        min_order_price:section.min_order_price,
        delivery_price: section.delivery_price,
        allowed_roles:section.allowed_roles,
        delivery_type: section.delivery_type,
      });
      const sectionSaved = await this.section_repo.save(sectionCreated);
    }
    // Get users.
    const data = fs.readFileSync('./json/category.json', 'utf8');
    const dataObject: Category[] = JSON.parse(data);

  
      for (const category of dataObject) {
        const categoryCreated = this.category_repo.create({
          name_ar: category.name_ar,
          name_en: category.name_en,
          logo: category.logo,
        });
        const categorySaved = await this.category_repo.save(categoryCreated);
        let index = 1;
        for (const subcategory of category['subcategories']) {
          const subcategoryCreated = this.subcategory_repo.create({
            name_ar: subcategory.name_ar,
            name_en: subcategory.name_en,
            logo: subcategory.logo,
          });
          const subcategorySaved = await this.subcategory_repo.save(
            subcategoryCreated,
          );
        
          index++;
        }
      }
    

    const section = await this.section_repo.find();
    const categories = await this.category_repo.find({order:{name_en:'DESC'}});
      const subcategories = await this.subcategory_repo.find({order:{name_en:'DESC'}});
    for (let index = 0; index < 14 ; index++) {
      const sectionCategory = new SectionCategory({
        section_id: section[ index>=7?0:1 ].id,
        category_id: categories[index>=7?index-7: index].id,
        order_by: index ,
      });
      await this.section_category_repo.save(sectionCategory);
    }
    const section_categories= await this.section_category_repo.find();
    for (let index = 0; index < section_categories.length; index++) {
      const categorySubCategory = new CategorySubCategory({
        section_category_id: section_categories[index].id,
      subcategory_id: subcategories[index].id,
        order_by: index,
      });

      await this.categorySubCategory.save(categorySubCategory);
      
    }


  }

  async drop(): Promise<any> {
    this.subcategory_repo.delete({});
    this.section_category_repo.delete({});

    this.categorySubCategory.delete({});
    this.section_repo.delete({});
    return this.category_repo.delete({});
  }
}
