import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Order } from './order.entity';
import { Subscription } from '../subscription/subscription.entity';
import { Customer } from '../customer/customer.entity';
import { PromoCode } from '../promo-code/promo-code.entity';

@Entity()
export class OrderInvoice extends AuditableEntity {
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total_price: number;

  @Column()
  invoice_number: string;

  @Column()
  company_address: string;

  @Column()
  vat_number: string;

  @Column()
  logo_app: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  vat: number;
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  vat_amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total_price_net: number;

  @OneToMany(() => Order, (order) => order.order_invoice)
  orders: Order[];

  @ManyToOne(() => Customer, (customer) => customer.order_invoices)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column()
  customer_id: string;

  @OneToOne(() => Subscription)
  @JoinColumn({ name: 'subscription_id' })
  subscription: Subscription;

  @Column()
  subscription_id: string;

  @ManyToOne(() => PromoCode, (promoCode) => promoCode.order_invoices)
  @JoinColumn({ name: 'promo_code_id' })
  promo_code: PromoCode;

  @Column({ nullable: true })
  promo_code_id: string;
}
