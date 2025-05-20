import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { CuisineType } from './cuisine-type.entity';
import { RestaurantCategory } from './restaurant-category.entity';
import { RestaurantStatus } from 'src/infrastructure/data/enums/restaurant-status.enum';
import { RestaurantAttachment } from './restaurant-attachment.entity';
import { User } from '../user/user.entity';
import { RestaurantAdmin } from './restaurant-admin.entity';
import { RestaurantOrder } from './order/restaurant_order.entity';
import { City } from '../city/city.entity';
import { OptionGroup } from './option/option-group.entity';
import { group } from 'console';
import { RestaurantGroup } from './restaurant-group.entity';
import { RestaurantSchedule } from './order/restaurant_schedule.entity';
import { de } from '@faker-js/faker';
@Entity()
export class Restaurant extends AuditableEntity {
  @Column()
  name_ar: string;

  @Column()
  name_en: string;

  @Column({ nullable: true })
  address_ar: string;

  @Column({ nullable: true })
  address_en: string;

  @Column({ default: RestaurantStatus.PENDING })
  status: RestaurantStatus;

  // latitude
  @Column({ type: 'float', precision: 10, scale: 6 })
  latitude: number;

  // longitude
  @Column({ type: 'float', precision: 11, scale: 6 })
  longitude: number;

  // @Column({
  //   type: 'geometry',
  //   spatialFeatureType: 'Point',
  //   srid: 4326,
  // })
  // location: string;

  @ManyToMany(() => CuisineType, (cuisine_type) => cuisine_type.restaurants)
  cuisine_types: CuisineType[];
  @ManyToMany(() => RestaurantGroup, (group) => group.restaurants)
  groups: RestaurantGroup[];

  @OneToMany(() => RestaurantSchedule, (schedule) => schedule.restaurant, {
    cascade: true,
  })
  schedules: RestaurantSchedule[];
  @OneToMany(
    () => RestaurantCategory,
    (restaurantCategory) => restaurantCategory.restaurant,
  )
  categories: RestaurantCategory[];

  @Column({ default: 0 })
  no_of_reviews: number;

  @Column({ nullable: true })
  logo: string;

  @Column({ nullable: true })
  image: string;

  @Column({ default: 0 })
  average_rating: number;

  @Column({ default: 0 })
  total_ratings: number;

  @Column({ default: 0 })
  average_prep_time: number;

  @Column({ default: 0 })
  min_order_price: number;

  @OneToMany(
    () => RestaurantAttachment,
    (restaurantAttachment) => restaurantAttachment.restaurant,
  )
  attachments: RestaurantAttachment[];

  @OneToMany(
    () => RestaurantAdmin,
    (restaurantAdmin) => restaurantAdmin.restaurant,
  )
  admins: RestaurantAdmin[];
  // @OneToMany(() => FoodBanar, (foodBanar) => foodBanar.restaurant)
  // banars: FoodBanar[];

  @OneToMany(
    () => RestaurantOrder,
    (restaurantOrder) => restaurantOrder.restaurant,
  )
  restaurant_orders: RestaurantOrder[];

  @ManyToOne(() => City)
  @JoinColumn()
  city: City;

  @Column({ nullable: true })
  city_id: string;

  @OneToMany(() => OptionGroup, (optionGroup) => optionGroup.restaurant)
  option_groups: OptionGroup[];

  @Column({ nullable: true })
  cashback: number;

  @Column({ type: 'simple-array' })
  contact_numbers: string;

  @Column({ default: false })
  order_pickup: boolean;
}
