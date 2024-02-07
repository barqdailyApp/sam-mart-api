import { AuditableEntity } from "src/infrastructure/base/auditable.entity";
import { Column, Entity, OneToOne } from "typeorm";
import { ShipmentChat } from "./shipment-chat.entity";

@Entity()
export class ShipmentChatAttachment extends AuditableEntity {
    @Column()
    file_type: string;

    @Column()
    file_name: string;

    @Column()
    file_url: string;

    @OneToOne(() => ShipmentChat, (shipment_chat) => shipment_chat.attachment, { onDelete: 'CASCADE' })
    shipment_chat: ShipmentChat;
}