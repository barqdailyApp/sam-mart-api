import { AuditableEntity } from "src/infrastructure/base/auditable.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from "typeorm";
import { User } from "../user/user.entity";
import { ShipmentChatAttachment } from "./shipment-chat-attachment.entity";
import { Shipment } from "./shipment.entity";

@Entity()
export class ShipmentChat extends AuditableEntity {
    @Column({ nullable: false })
    message: string;

    @ManyToOne(() => User, (user) => user.shipment_chats, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ nullable: true })
    user_id: string;

    @OneToOne(() => ShipmentChatAttachment, (attachment) => attachment.shipment_chat, { cascade: true })
    @JoinColumn({ name: 'attachment_id' })
    attachment: ShipmentChatAttachment;

    @Column({ nullable: true })
    attachment_id: string;

    @ManyToOne(() => Shipment, (shipment) => shipment.shipment_chats, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'shipment_id' })
    shipment: Shipment;

    @Column({ nullable: true })
    shipment_id: string;

    @Column({ nullable: true })
    return_order_id: string;
}