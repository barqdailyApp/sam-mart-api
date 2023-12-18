import { Vehicle } from '../vehicle/vehicle.entity';
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { Points } from '../points/point.entity';
import { User } from '../user/user.entity';
import { OwnedEntity } from 'src/infrastructure/base/owned.entity';
import { Gift } from '../gift/gift.entity';
import { Subscription } from '../subscription/subscription.entity';
import { Order } from '../order/order.entity';
import { OrderInvoice } from '../order/order-invoice.entity';
@Entity()
export class Customer extends OwnedEntity {
  @OneToOne(() => User, (user) => user.customer, {
  onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Vehicle, (Vehicle) => Vehicle.customer)
  vehicles: Vehicle[];

  @OneToMany(()=>Subscription,subscription=>subscription.customer)
  subscriptions:Subscription[]

  @OneToMany(() => Gift, (gift) => gift.sender)
  gifts_sender: Gift[];

  @OneToMany(() => Gift, (gift) => gift.receiver)
  gifts_receiver: Gift[];
  @OneToMany(() => OrderInvoice, (orderInvoice) => orderInvoice.customer)
  order_invoices: OrderInvoice[];

  @OneToMany(()=>Order,order=>order.customer)
  orders:Order[]

  constructor(data: Partial<Customer>) {
    super();
    Object.assign(this, data);
  }
}
