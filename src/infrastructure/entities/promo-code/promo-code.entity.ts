import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import { Order } from '../order/order.entity';
import { User } from '../user/user.entity';
import { PaymentMethod } from '../payment_method/payment_method.entity';
import { DriverTypeEnum } from 'src/infrastructure/data/enums/driver-type.eum';
import { RestaurantOrder } from '../restaurant/order/restaurant_order.entity';
@Entity()
export class PromoCode extends AuditableEntity {
  @Column({unique:true})
  code: string;

  @Column()
  discount: number;

  @Column({default:true})
  is_active:boolean

@Column({default:DriverTypeEnum.MART})
type:DriverTypeEnum

  @OneToMany(() => Order, (order) => order.promo_code)
  orders: Order[];
  @OneToMany(() => RestaurantOrder, (restaurant_order) => restaurant_order.promo_code)
  restaurant_orders: RestaurantOrder[]

  @Column()
  expire_at: Date;

  @Column()
  number_of_uses: number;

  @Column({default:false})
  use_once:boolean


  @Column({type:'simple-array',nullable:true})
  user_ids:string[]


  @Column({default:0})
  current_uses: number;

  @Column({nullable:true})
  note:string


  @ManyToMany(() => PaymentMethod, (payment_method) => payment_method.promo_codes)
  @JoinTable({name:"promo_code_payment_method"})
  payment_methods: PaymentMethod[]; 
}
