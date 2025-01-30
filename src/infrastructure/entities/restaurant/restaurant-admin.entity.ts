import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Restaurant } from './restaurant.entity';
import Joi from 'joi';
import { User } from '../user/user.entity';
@Entity()
export class RestaurantAdmin extends AuditableEntity {
  @ManyToOne(() => Restaurant, (restaurant) => restaurant.admins)
  @JoinColumn()
  restaurant: Restaurant;

  @Column({nullable:true})
  restaurant_id: string;
  @ManyToOne(() => User)
  @JoinColumn()
  user: User;

  @Column({nullable:true})
  user_id: string;
  constructor(data: Partial<RestaurantAdmin>) {
    super();
    Object.assign(this, data);
  }

}
