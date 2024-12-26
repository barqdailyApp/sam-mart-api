import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Restaurant } from './restaurant.entity';
import { Meal } from './meal.entity';
@Entity('')
export class RestaurantCategory extends AuditableEntity {
  @Column()
  name_ar: string;

  @Column()
  name_en: string;

  @Column()
  order_by: number;

  @Column({default:true})
  is_active: boolean

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.categories)
  @JoinColumn()
  restaurant: Restaurant;
  @Column()
  restaurant_id: string;

  @OneToMany(() => Meal, (meal) => meal.restaurant_category)
  meals: Meal[]


}
