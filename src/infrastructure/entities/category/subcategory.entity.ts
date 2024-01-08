import { Column, Entity, ManyToOne, OneToMany, OneToOne } from "typeorm";
import { Category } from "./category.entity";
import { BaseEntity } from "src/infrastructure/base/base.entity";
import { CategorySubCategory } from "./category-subcategory.entity";
import { ProductSubCategory } from "../product/product-sub-category.entity";
import { MostHitSubcategory } from "./most-hit-subcategory.entity";

@Entity()
export class Subcategory extends BaseEntity {

  @Column()
  name_ar: string;
  @Column()
  name_en: string;
  @Column()
  logo: string;

   @OneToMany(() => CategorySubCategory, categorySubCategory => categorySubCategory.subcategory,{onDelete:"CASCADE"})
  
   category_subCategory: CategorySubCategory[]

  
   @OneToMany(() => ProductSubCategory, (productSubCategory) => productSubCategory.sub_category)
   product_sub_categories: ProductSubCategory[];

  @OneToOne(() => MostHitSubcategory, mostHitSubcategory => mostHitSubcategory.subcategory)
  most_hit_subcategory: MostHitSubcategory;



  constructor(partial?: Partial<Subcategory>) {
    super();
    Object.assign(this, partial);
  }
}
