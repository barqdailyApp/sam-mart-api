import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import { OrderStatus } from 'src/infrastructure/data/enums/order-status.enum';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Package } from '../package/package.entity';
import { Service } from '../package/service.entity';
import { OrderImage } from './order-image.entity';
import { Biker } from '../biker/biker.entity';
import { Slot } from '../slot/slot.entity';
import { Customer } from '../customer/customer.entity';
import { PromoCode } from '../promo-code/promo-code.entity';
import { Vehicle } from '../vehicle/vehicle.entity';
import { Address } from '../user/address.entity';
import { Subscription } from '../subscription/subscription.entity';
import { SubscriptionPackageService } from '../subscription/subscription-service.entity';
import { tr } from '@faker-js/faker';
import { OrderServices } from './order-services';
import { OrderInvoice } from './order-invoice.entity';
import { ReportAbuse } from '../order-cancel/report_abuse.entity';

@Entity()
export class Order extends AuditableEntity {
  @Column()
  number: string;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.CREATED })
  status: OrderStatus;

  // TODO : REPLACE WITH subscription
  @ManyToOne(() => Subscription, (subscription) => subscription.orders, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'subscription_id' })
  subscription: Subscription;

  @Column()
  subscription_id: string;

  @ManyToOne(() => OrderInvoice, (orderInvoice) => orderInvoice.orders)
  @JoinColumn({ name: 'order_invoice_id' })
  order_invoice: OrderInvoice;

  @Column({nullable:true})
  order_invoice_id: string;


  @OneToMany(() => OrderServices, (orderSrvice) => orderSrvice.order)
  services: OrderServices[];



  @ManyToOne(() => Biker, (biker) => biker.orders)
  @JoinColumn({ name: 'biker_id' })
  biker: Biker;

  @Column({nullable:true})
  biker_id: string;

  @ManyToOne(() => Slot, (slot) => slot.orders)
  @JoinColumn({ name: 'slot_id' })
  slot: Slot;

  @Column()
  slot_id: string;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column()
  customer_id: string;

  @Column()
  order_date: string;

  @ManyToOne(() => Vehicle, (vehicle) => vehicle.orders)
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @Column()
  vehicle_id: string;

  @ManyToOne(() => Address, (address) => address.orders)
  @JoinColumn({ name: 'address_id' })
  address: Address;

  @Column()
  address_id: string;

  @Column()
  wash_count_current: number;

  @OneToOne(() => ReportAbuse, (reportAbuse) => reportAbuse.order, )
  report_abuse: ReportAbuse;
  

  constructor(data: Partial<Order>) {
    super();
    Object.assign(this, data);
  }
}
