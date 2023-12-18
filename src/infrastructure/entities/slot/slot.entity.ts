import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Order } from '../order/order.entity';


@Entity()
export class Slot extends AuditableEntity {
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    start_time:number;
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    end_time:number;

    @OneToMany(()=>Order,order=>order.slot)
    orders:Order[]

    @Column()
    name:string;

    @Column()
    order_by:number;


    @Column({nullable:true})
    in_active_start_date:Date;

    @Column({nullable:true})
    in_active_end_date:Date;

  
}
