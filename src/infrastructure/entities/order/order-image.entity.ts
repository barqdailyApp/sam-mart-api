import { AuditableEntity } from "src/infrastructure/base/auditable.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";

import { OrderDetails } from "./order-details";
import { OrderImageType } from "src/infrastructure/data/enums/order-image.enum";

@Entity()
export class OrderImage extends AuditableEntity {
    @ManyToOne(() => OrderDetails, (OrderDetails) => OrderDetails.order_images)
    @JoinColumn({ name: 'order_details_id' })
    order_details: OrderDetails;

    @Column({ type: 'enum', enum: OrderImageType})
    type:OrderImageType
    @Column()
    order_details_id: string;

    @Column()
    image_url: string;


}