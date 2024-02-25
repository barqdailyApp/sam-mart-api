import { AuditableEntity } from "src/infrastructure/base/auditable.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from "typeorm";
import { ShipmentProduct } from "../shipment-product.entity";
import { ReturnProductReason } from "./return-product-reason.entity";
import { ReturnOrderStatus } from "src/infrastructure/data/enums/return-order-status.enum";
import { ReturnOrder } from "./return-order.entity";

@Entity()
export class ReturnOrderProduct extends AuditableEntity {
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

    @ManyToOne(
        () => ShipmentProduct,
        shipmentProduct => shipmentProduct.returnOrderProduct,
        { onDelete: 'CASCADE' }
    ) 
    @JoinColumn({ name: 'shipment_product_id' })
    shipmentProduct: ShipmentProduct;

    @Column()
    shipment_product_id: string;

    @ManyToOne(
        () => ReturnProductReason,
        returnProductReason => returnProductReason.returnOrderProducts,
        { onDelete: 'SET NULL' }
    )
    @JoinColumn({ name: 'return_product_reason_id' })
    returnProductReason: ReturnProductReason;

    @Column({ nullable: true })
    return_product_reason_id: string;

    @ManyToOne(
        () => ReturnOrder,
        returnOrder => returnOrder.returnOrderProducts,
        { onDelete: 'CASCADE' }
    )
    @JoinColumn({ name: 'return_order_id' })
    returnOrder: ReturnOrder;

    @Column()
    return_order_id: string;

}