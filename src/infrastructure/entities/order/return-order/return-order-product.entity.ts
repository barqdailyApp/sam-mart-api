import { AuditableEntity } from "src/infrastructure/base/auditable.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from "typeorm";
import { ShipmentProduct } from "../shipment-product.entity";
import { ReturnOrderReason } from "./return-order-reason.entity";
import { ReturnOrderStatus } from "src/infrastructure/data/enums/return-order-status.enum";

@Entity()
export class ReturnOrderProduct extends AuditableEntity {
    @Column({
        type: 'enum',
        enum: ReturnOrderStatus,
        default: ReturnOrderStatus.PENDING
    })
    status: ReturnOrderStatus;

    @Column()
    admin_notes: string;

    @Column({nullable: true})
    customer_notes: string;

    @OneToOne(
        () => ShipmentProduct,
        shipmentProduct => shipmentProduct.returnOrderProduct,
        { onDelete: 'CASCADE' }
    )
    @JoinColumn({ name: 'shipment_product_id' })
    shipmentProduct: ShipmentProduct;

    @Column()
    shipment_product_id: string;

    @ManyToOne(
        () => ReturnOrderReason,
        returnOrderReason => returnOrderReason.returnOrderProducts,
        { onDelete: 'SET NULL' }
    )
    @JoinColumn({ name: 'return_order_reason_id' })
    returnOrderReason: ReturnOrderReason;

    @Column()
    return_order_reason_id: string;

}