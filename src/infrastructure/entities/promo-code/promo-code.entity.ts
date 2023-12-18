import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import { Customer } from '../customer/customer.entity';
import { Biker } from '../biker/biker.entity';
import { User } from '../user/user.entity';
import { Order } from '../order/order.entity';
import { Subscription } from '../subscription/subscription.entity';
import { OrderInvoice } from '../order/order-invoice.entity';
import { Gift } from '../gift/gift.entity';

@Entity()
export class PromoCode extends AuditableEntity {
  @Column({ unique: true })
  code: string;


  @ManyToMany(() => User)
  @JoinTable()
  users: User[]

  
  @Column()
  start_time: Date;

  @Column()
  end_time: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount: number;

  @Column({ default: 0 })
  current_uses: number;



  @Column()
  max_use_by_users: number;

  @OneToMany(() => Subscription, (subscription) => subscription.promo_code)
  subscriptions: Subscription[];

  @OneToMany(() => OrderInvoice, (orderInvoice) => orderInvoice.promo_code)
  order_invoices: OrderInvoice[];
  

}
