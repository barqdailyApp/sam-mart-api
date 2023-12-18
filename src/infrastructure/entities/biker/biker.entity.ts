import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Slot } from '../slot/slot.entity';
import { Points } from '../points/point.entity';
import { OwnedEntity } from 'src/infrastructure/base/owned.entity';
import { Order } from '../order/order.entity';

@Entity()
export class Biker extends OwnedEntity {
  @OneToOne(() => User, {
    onDelete: 'CASCADE',
    })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: 0 })
  orders_count: number;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  location: string;

  

  @Column({ type: 'float', precision: 10, scale: 6 })
  latitude: number;

  @Column({ type: 'float', precision: 11, scale: 6 })
  longitude: number;

  @Column({ type: 'float', precision: 10, scale: 6 })
  start_latitude: number;

  @Column({ type: 'float', precision: 11, scale: 6 })
  start_longitude: number;


  @OneToMany(() => Order, (order) => order.biker)
  orders: Order[];


  @Column({nullable:true})
  in_active_start_date:Date;

  @Column({nullable:true})
  in_active_end_date:Date;
  constructor(data: Partial<Biker>) {
    super();
    Object.assign(this, data);
  }

  @BeforeUpdate()
  updateLocation() {
    this.location = `POINT(${this.latitude} ${this.longitude})`;
  }
  @BeforeInsert()
  initLocation() {
    this.start_longitude=this.longitude
    this.start_latitude= this.latitude
    this.location = `POINT(${this.latitude} ${this.longitude})`;
  }

}
