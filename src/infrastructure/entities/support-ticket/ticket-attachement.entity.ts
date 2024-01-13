import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import { SupportTicket } from './support-ticket.entity';
import { TicketComment } from './ticket-comment.entity';

@Entity()
export class TicketAttachment extends AuditableEntity {
    @Column()
    file_type: string;

    @Column()
    file_name: string;

    @Column()
    file_url: string;

    @OneToOne(() => SupportTicket, (ticket) => ticket.attachment, { cascade: true })
    ticket: SupportTicket;

    @OneToOne(() => TicketComment, (comment) => comment.attachment, { cascade: true })
    comment: TicketComment;
}