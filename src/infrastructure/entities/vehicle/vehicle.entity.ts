import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';

import { VehicleBrandModel } from './vehicle-brand-model.entity';
import { VehicleBrand } from './vehicle-brand.entity';
import { VehicleImage } from './vehicle-image.entity';
import { Customer } from '../customer/customer.entity';
import { Order } from '../order/order.entity';
import { Color } from '../color/color.entity';

@Entity()
export class Vehicle extends AuditableEntity {
  @ManyToOne(() => VehicleBrand)
  @JoinColumn({ name: 'brand_id' })
  brand: VehicleBrand;

  @Column()
  brand_id: string;

  @ManyToOne(() => VehicleBrandModel)
  @JoinColumn({ name: 'brand_model_id' })
  brand_model: VehicleBrandModel;

  @Column()
  brand_model_id: string;

  @Column({ nullable: true })
  plate: string;

  @OneToMany(() => VehicleImage, (image) => image.vehicle, {
    cascade: true,
  })
  images: VehicleImage[];

  @ManyToOne(() => Customer, (customer) => customer.vehicles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column()
  customer_id: string;

  @OneToMany(() => Order, (order) => order.vehicle)
  orders: Order[];

  @ManyToOne(() => Color, (color) => color.vehicles)
  @JoinColumn({ name: 'color_id' })
  color: Color;
  @Column()
  color_id: string;
  constructor(partial: Partial<Vehicle>) {
    super();
    Object.assign(this, partial);
  }
}
