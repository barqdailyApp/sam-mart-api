import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { RestaurantOrderMeal } from './restaurant_order_meal.entity';
import { Option } from '../option/option.entity';
@Entity()
export class RestaurantOrderMealOption extends AuditableEntity {
  @ManyToOne(
    () => RestaurantOrderMeal,
    (orderMeal) => orderMeal.restaurant_order_meal_options,
  )
  @JoinColumn()
  restaurant_order_meal: RestaurantOrderMeal;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column()
  quantity: number;
  @ManyToOne(() => Option)
  @JoinColumn()
  option: Option;
}
