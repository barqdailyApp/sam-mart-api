import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import { Entity, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { User } from '../user/user.entity';
import { SupportTicket } from './support-ticket.entity';
import { TicketAttachment } from './ticket-attachement.entity';

@Entity()
export class TicketComment extends AuditableEntity {
    @ManyToOne(() => User, (user) => user.ticket_comments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ nullable: false })
    user_id: string;

    @ManyToOne(()=> SupportTicket, (ticket) => ticket.ticket_comments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'ticket_id' })
    ticket: SupportTicket;

    @Column({ nullable: false })
    ticket_id: string;

    @OneToOne(() => TicketAttachment, (attachment) => attachment.comment)
    @JoinColumn({ name: 'attachment_id' })
    attachment: TicketAttachment;

    @Column({ nullable: true })
    attachment_id: string;

    @Column({ nullable: false })
    comment_text: string;
}