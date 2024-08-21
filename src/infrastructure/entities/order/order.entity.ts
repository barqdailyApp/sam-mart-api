import { OwnedEntity } from 'src/infrastructure/base/owned.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Address } from '../user/address.entity';
import { Section } from '../section/section.entity';
import { DeliveryType } from 'src/infrastructure/data/enums/delivery-type.enum';
import { User } from '../user/user.entity';
import { Warehouse } from '../warehouse/warehouse.entity';
import { PaymentMethodEnum } from 'src/infrastructure/data/enums/payment-method';

import { Slot } from './slot.entity';
import { Shipment } from './shipment.entity';
import { Transaction } from '../wallet/transaction.entity';
import { ReturnOrder } from './return-order/return-order.entity';
import { PaymentMethod } from '../payment_method/payment_method.entity';
import { Reason } from '../reason/reason.entity';
import { PromoCode } from '../promo-code/promo-code.entity';

@Entity()
export class Order extends OwnedEntity {
  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn()
  user: User;

  @OneToMany(() => Shipment, (shipment) => shipment.order)
  shipments: Shipment[];

  @OneToMany(() => Transaction, (transaction) => transaction.order)
  transactions: Transaction[];
  @ManyToOne(() => Warehouse, (warehouse) => warehouse.orders)
  @JoinColumn()
  warehouse: Warehouse;
  @Column()
  warehouse_id: string;

  @ManyToOne(() => Address, (address) => address.orders)
  @JoinColumn()
  address: Address;



  @ManyToOne(() => PromoCode, (promoCode) => promoCode.orders)
  @JoinColumn()
  promo_code: PromoCode;
  @Column({ nullable: true })
  promo_code_id: string;
  @Column()
  address_id: string;

  @ManyToOne(() => Section, (section) => section.orders)
  @JoinColumn()
  section: Section;

  @Column()
  section_id: string;

  @OneToMany(() => ReturnOrder, (returnOrderRequest) => returnOrderRequest.order, { cascade: true })
  returnOrders: ReturnOrder[];

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  products_price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total_price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  delivery_fee: number;

  @Column()
  payment_method: PaymentMethodEnum;

  @Column({ default: false })
  is_paid: boolean;

  @Column({ length: 10, unique: true })
  number: string;

  @Column()
  delivery_type: DeliveryType;

  @Column({ nullable: true })
  estimated_delivery_time: Date;

  @ManyToOne(() => Slot, (slot) => slot.orders)
  @JoinColumn()
  slot: Slot;

  @ManyToOne(() => PaymentMethod, (paymentMethod) => paymentMethod.orders)
  @JoinColumn()
  paymentMethod: PaymentMethod;
  @Column({ nullable: true })
  payment_method_id: string;

  @Column({ nullable: true })
  transaction_number: string;

  @Column({ nullable: true })
  delivery_day: string;

  @Column({ nullable: true })
  note: string;

  @Column({ nullable: true })
  slot_id: string;

  @Column({nullable:true})
  promo_code_discount:number
}
