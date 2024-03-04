import { AuditableEntity } from "src/infrastructure/base/auditable.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { Order } from "../order.entity";
import { ReturnOrderStatus } from "src/infrastructure/data/enums/return-order-status.enum";
import { ReturnOrderProduct } from "./return-order-product.entity";
import { Driver } from "../../driver/driver.entity";


@Entity()
export class ReturnOrder extends AuditableEntity {
    @Column({
        type: 'enum',
        enum: ReturnOrderStatus,
        default: ReturnOrderStatus.PENDING
    })
    status: ReturnOrderStatus;

    // this column for the admin to write notes about the return order in case of any issue
    @Column({ type: 'text', nullable: true })
    admin_note: string;

    // this column for the customer to write notes about the return order in case of any issue
    @Column({ type: 'text', nullable: true })
    customer_note: string;

    @ManyToOne(() => Order, order => order.returnOrders, { onDelete: "CASCADE" })
    @JoinColumn({ name: "order_id" })
    order: Order;

    @Column()
    order_id: string;

    @OneToMany(
        () => ReturnOrderProduct,
        returnOrderProduct => returnOrderProduct.returnOrder,
        { cascade: true }
    )
    returnOrderProducts: ReturnOrderProduct[];

    @ManyToOne(() => Driver, (driver) => driver.returnOrders, { onDelete: "SET NULL" })
    driver: Driver;

    @Column({ nullable: true })
    driver_id: string;
}