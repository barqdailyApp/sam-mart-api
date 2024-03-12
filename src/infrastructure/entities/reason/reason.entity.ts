import { AuditableEntity } from "src/infrastructure/base/auditable.entity";
import { ReasonType } from "src/infrastructure/data/enums/reason-type.enum";
import { Column, Entity, OneToMany } from "typeorm";
import { SupportTicket } from "../support-ticket/support-ticket.entity";
import { ReturnOrderProduct } from "../order/return-order/return-order-product.entity";
import { Order } from "../order/order.entity";
import { Role } from "src/infrastructure/data/enums/role.enum";

@Entity()
export class Reason extends AuditableEntity {
    @Column()
    name_en: string;

    @Column()
    name_ar: string;

    @Column({
        type: 'enum',
        nullable: false,
        enum: ReasonType
    })
    type: ReasonType;

    @Column({ type: 'set', enum: Role, default: [Role.CLIENT] })
    roles: Role[];

    @OneToMany(() => SupportTicket, support_ticket => support_ticket.subject)
    support_tickets: SupportTicket[];

    @OneToMany(() => ReturnOrderProduct, returnOrderProduct => returnOrderProduct.returnProductReason)
    returnOrderProducts: ReturnOrderProduct[];

    @OneToMany(() => Order, order => order.cancelOrderReason)
    cancelOrder: Order[];
}