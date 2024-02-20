import { BaseEntity } from "src/infrastructure/base/base.entity";
import { Column, Entity, OneToMany } from "typeorm";
import { SupportTicket } from "./support-ticket.entity";

@Entity()
export class SupportTicketSubject extends BaseEntity {
    @Column()
    title: string;

    @OneToMany(() => SupportTicket, (ticket) => ticket.subject)
    support_tickets: SupportTicket[];
}