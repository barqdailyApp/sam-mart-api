import { Res } from '@nestjs/common';
import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { RestaurantOrder } from './restaurant_order.entity';
import { Meal } from '../meal/meal.entity';
import { RestaurantCartMealOption } from '../cart/restaurant-cart-meal-option.entity';
import { RestaurantOrderMealOption } from './restaurant_order_meal_option.entity';

@Entity()
export class RestaurantOrderMeal extends AuditableEntity {
  @ManyToOne(() => RestaurantOrder, (order) => order.restaurant_order_meals)
  @JoinColumn()
  restaurant_order: RestaurantOrder;

  @Column()
  restaurant_order_id: string;

  @ManyToOne(() => Meal)
  @JoinColumn()
  meal: Meal;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total_price: number;

  @Column()
  quantity: number;

  @Column()
  meal_id: string;

  @OneToMany(
    () => RestaurantOrderMealOption,
    (restaurantCartMealOption) =>
      restaurantCartMealOption.restaurant_order_meal,{cascade:true}
  )
  restaurant_order_meal_options: RestaurantOrderMealOption[];
}
