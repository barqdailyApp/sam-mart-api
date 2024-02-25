import { AuditableEntity } from "src/infrastructure/base/auditable.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { Order } from "../order.entity";
import { ReturnOrderStatus } from "src/infrastructure/data/enums/return-order-status.enum";

@Entity()
export class ReturnOrderRequest extends AuditableEntity {
    @Column({
        type: 'enum',
        enum: ReturnOrderStatus,
        default: ReturnOrderStatus.PENDING
    })
    status: ReturnOrderStatus;

    @ManyToOne(() => Order, order => order.returnOrders, { onDelete: "CASCADE" })
    @JoinColumn({ name: "order_id" })
    order: Order;

    @Column()
    orderId: string;

    // this column for the admin to write notes about the return order in case of any issue
    @Column({ type: 'text', nullable: true })
    admin_note: string;
}