import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import { Entity, Column } from 'typeorm';

@Entity()
export class Banar extends AuditableEntity {
    @Column()
    banar: string;

    @Column()
    started_at: Date;

    @Column()
    ended_at: Date;

    @Column()
    is_active: boolean;

    @Column({default: false})
    is_popup:boolean
}
