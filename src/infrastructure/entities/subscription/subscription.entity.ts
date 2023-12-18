import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { OwnedEntity } from 'src/infrastructure/base/owned.entity';
import { SubscriptionPackageService } from './subscription-service.entity';
import { Customer } from '../customer/customer.entity';
import { Order } from '../order/order.entity';
import { SubscriptionStatus } from 'src/infrastructure/data/enums/subscription.enum';
import { PromoCode } from '../promo-code/promo-code.entity';
import { OrderInvoice } from '../order/order-invoice.entity';

@Entity()
export class Subscription extends AuditableEntity {
  @Column()
  name_ar: string;

  @Column()
  name_en: string;

  @ManyToOne(() => Customer, (customer) => customer.subscriptions)
  @JoinColumn()
  customer: Customer;

  @Column()
  customer_id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total_price_package: number;
  
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price_wash_single: number;

  @Column()
  wash_count: number;

  @Column({nullable:true})
  total_was_count:number

  @Column({nullable:true})
  reschedule_times:number

  

  @Column({default:SubscriptionStatus.ACTIVE})
  status:SubscriptionStatus;

  @Column({nullable:true})
  description_ar: string;

  @Column({nullable:true})
  description_en: string;

  @OneToMany(
    () => Order,
    (order) => order.subscription,
  )
  orders: Order[];

  @Column()
  background_url: string;

  //* package expires after thirty days (for example) from the beginning of the reservation
  @Column()
  expiry_date: Date;

  @OneToMany(
    () => SubscriptionPackageService,
    (package_service) => package_service.subscription,
  )
  service: SubscriptionPackageService[];



  @ManyToOne(() => PromoCode, (promoCode) => promoCode.subscriptions)
  @JoinColumn({ name: 'promo_code_id' })
  promo_code: PromoCode;

  @Column({ nullable: true })
  promo_code_id: string;

  @OneToOne(() => OrderInvoice)
  @JoinColumn({ name: 'order_invoice_id' })
  order_invoice: OrderInvoice;

  @Column({nullable :true})
  order_invoice_id: string;
  constructor(data: Partial<Subscription>) {
    super();
    Object.assign(this, data);
  }
}
