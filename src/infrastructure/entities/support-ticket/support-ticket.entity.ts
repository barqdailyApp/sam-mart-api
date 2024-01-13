import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import { Entity, Column, ManyToOne, JoinColumn, BeforeInsert, OneToMany, OneToOne } from 'typeorm';
import { User } from '../user/user.entity';
import { v4 as uuidv4 } from 'uuid';
import { SupportTicketStatus } from 'src/infrastructure/data/enums/support-ticket-status.enum';
import { TicketComment } from './ticket-comment.entity';
import { TicketAttachment } from './ticket-attachement.entity';

@Entity()
export class SupportTicket extends AuditableEntity {
    @ManyToOne(() => User, (user) => user.support_tickets, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ nullable: false })
    user_id: string;

    @OneToMany(() => TicketComment, (comment) => comment.ticket, { cascade: true })
    ticket_comments: TicketComment[];

    @OneToOne(()=>TicketAttachment, (attachment) => attachment.ticket)
    @JoinColumn({ name: 'attachment_id' })
    attachment: TicketAttachment;

    @Column({ nullable: true })
    attachment_id: string;

    @Column({ nullable: false })
    subject: string;

    @Column({ nullable: false })
    description: string;

    @Column({
        type: 'enum',
        nullable: false,
        default: SupportTicketStatus.OPEN,
        enum: SupportTicketStatus
    })
    status: SupportTicketStatus;

    @Column({ nullable: false, unique: true })
    ticket_num: string;

    @BeforeInsert()
    async generateTicketNum() {
        const uuid = uuidv4();
        this.ticket_num = uuid.substr(0, 4) + '-' + uuid.substr(4, 4);
    }
}