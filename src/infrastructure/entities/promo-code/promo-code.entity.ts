import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Order } from '../order/order.entity';
import { User } from '../user/user.entity';
@Entity()
export class PromoCode extends AuditableEntity {
  @Column({unique:true})
  code: string;

  @Column()
  discount: number;

  @Column({default:true})
  is_active:boolean



  @OneToMany(() => Order, (order) => order.promo_code)
  orders: Order[];

  @Column()
  expire_at: Date;

  @Column()
  number_of_uses: number;

  @Column({default:0})
  current_uses: number;

  @Column({nullable:true})
  note:string
}
