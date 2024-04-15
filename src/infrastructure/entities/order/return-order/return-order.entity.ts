import { AuditableEntity } from "src/infrastructure/base/auditable.entity";
import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { Order } from "../order.entity";
import { ReturnOrderStatus } from "src/infrastructure/data/enums/return-order-status.enum";
import { ReturnOrderProduct } from "./return-order-product.entity";
import { Driver } from "../../driver/driver.entity";
import { randNum, randStr } from "src/core/helpers/cast.helper";


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

    @Column({ nullable: false, unique: true })
    return_number: string;

    @Column({ nullable: true })
    request_accepted_at: Date;

    @BeforeInsert()
    async generateReturnNumber() {
        this.return_number = `${randStr(2)}${randNum(6)}`
    }
}