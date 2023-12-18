import { Column, Entity } from 'typeorm';
import { BaseEntity } from 'src/infrastructure/base/base.entity';

@Entity()
export class TermsConditions extends BaseEntity {
  @Column({type:"longtext"})
  title_ar: string;

  @Column({type:"longtext"})
  description_ar: string;

  @Column({type:"longtext"})
  title_en: string;

  @Column({type:"longtext"})
  description_en: string;
}
