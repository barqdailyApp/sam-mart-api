import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntity } from "src/infrastructure/base/base.entity";
import { CategorySubCategory } from "./category-subcategory.entity";
import { ProductSubCategory } from "../product/product-sub-category.entity";

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

  constructor(partial?: Partial<Subcategory>) {
    super();
    Object.assign(this, partial);
  }
}