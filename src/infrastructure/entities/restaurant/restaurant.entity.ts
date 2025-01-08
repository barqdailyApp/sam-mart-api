import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import { Column, Entity, ManyToMany, OneToMany } from 'typeorm';
import { CuisineType } from './cuisine-type.entity';
import { RestaurantCategory } from './restaurant-category.entity';
import { RestaurantStatus } from 'src/infrastructure/data/enums/restaurant-status.enum';
import { FoodBanar } from './food_banar.entity';
import { RestaurantAttachment } from './restaurant-attachment.entity';
import { User } from '../user/user.entity';
import { RestaurantAdmin } from './restaurant-admin.entity';
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

  @Column({ nullable: true })
  opening_time: string;

  @Column({ nullable: true })
  closing_time: string;

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
}
