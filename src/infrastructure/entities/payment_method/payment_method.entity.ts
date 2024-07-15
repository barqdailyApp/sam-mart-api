import { BaseEntity } from 'src/infrastructure/base/base.entity';
import { PaymentMethodEnum } from 'src/infrastructure/data/enums/payment-method';
import { Column, Entity, ManyToMany, OneToMany } from 'typeorm';
import { Order } from '../order/order.entity';
import { PromoCode } from '../promo-code/promo-code.entity';

@Entity()
export class PaymentMethod extends BaseEntity {
  @Column()
  type: PaymentMethodEnum;
  @OneToMany(() => Order, (order) => order.payment_method)
  orders: Order[];
  @Column({ nullable: true })
  logo: string;

  @Column({ nullable: true })
  order_by: number;

  @ManyToMany(() => PromoCode, (promo_code) => promo_code.payment_methods)
  promo_codes: PromoCode[];

  @Column({ unique: true })
  name_ar: string;
  @Column({ unique: true })
  name_en: string;
  @Column({ default: true })
  is_active: boolean;

  @Column({ nullable: true })
  wallet_number: string;

  constructor(data: Partial<PaymentMethod>) {
    super();
    Object.assign(this, data);
  }
}
