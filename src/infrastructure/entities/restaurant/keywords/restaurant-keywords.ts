import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import { Column, Entity } from 'typeorm';
@Entity('restaurant_keywords')
export class RestaurantKeywords extends AuditableEntity {
  @Column()
  name_ar: string;

  @Column()
  name_en: string;
}
