import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Restaurant } from '../restaurant.entity';
import { RestaurantOrderMeal } from './restaurant_order_meal.entity';
import { User } from '../../user/user.entity';

import { Address } from '../../user/address.entity';
import { PlatformType } from 'src/infrastructure/data/enums/order-with-type.enum';
import { PaymentMethod } from '../../payment_method/payment_method.entity';
import { Slot } from '../../order/slot.entity';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { ShipmentStatusEnum } from 'src/infrastructure/data/enums/shipment_status.enum';
import { Reason } from '../../reason/reason.entity';
import { Driver } from '../../driver/driver.entity';
import { DeliveryType } from 'src/infrastructure/data/enums/delivery-type.enum';
import { PaymentMethodEnum } from 'src/infrastructure/data/enums/payment-method';
@Entity()
export class RestaurantOrder extends AuditableEntity {
  @Column({ length: 10 })
  number: string;

  @Column({ default: false })
  is_paid: boolean;

  @Column({ nullable: true })
  note: string;
  @ManyToOne(() => Address)
  @JoinColumn()
  address: Address;

  @Column()
  address_id: string;


   @Column()
    delivery_type: DeliveryType;
  

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    total_price: number;
  
    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    delivery_fee: number;


  @ManyToOne(() => Driver, (driver) => driver.restaurant_orders)
  @JoinColumn()
  driver: Driver;
  @Column({ nullable: true })
  driver_id: string;

  @ManyToOne(() => User, (user) => user.restaurant_orders)
  @JoinColumn()
  user: User;
  @Column()
  user_id: string;
  @ManyToOne(() => Restaurant, (restaurant) => restaurant.restaurant_orders)
  @JoinColumn()
  restaurant: Restaurant;
  @Column({ nullable: true })
  restaurant_id: string;
  @OneToMany(
    () => RestaurantOrderMeal,
    (restaurantOrderMeal) => restaurantOrderMeal.restaurant_order,
  )
  restaurant_order_meals: RestaurantOrderMeal[];

  @Column({ default: PlatformType.MOBILE })
  platform: PlatformType;

  @ManyToOne(() => PaymentMethod)
  @JoinColumn()
  payment_method: PaymentMethod;

   @Column()
    payment_method_enum: PaymentMethodEnum;

  @Column({ nullable: true })
  payment_method_id: string;

  @Column({ nullable: true })
  estimated_delivery_time: Date;

  @ManyToOne(() => Slot)
  @JoinColumn()
  slot: Slot;

  @Column({ nullable: true })
  slot_id: string;


  @Column({ default: ShipmentStatusEnum.PENDING })
  status: ShipmentStatusEnum;

  @ManyToOne(() => Reason, (reason) => reason.cancelShipment, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'cancel_reason_id' })
  cancelShipmentReason: Reason;

  @Column({ nullable: true })
  cancel_reason_id: string;

  @Column({ type: 'enum', enum: Role, nullable: true })
  canceled_by: Role;

  @Column({ nullable: true })
  order_confirmed_at: Date;

  @Column({ nullable: true })
  order_on_processed_at: Date;

  @Column({ nullable: true })
  order_ready_for_pickup_at: Date;

  @Column({ nullable: true })
  order_shipped_at: Date;

  @Column({ nullable: true })
  order_delivered_at: Date;

  @Column({ nullable: true })
  order_canceled_at: Date;
}
