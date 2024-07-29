import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../user/user.entity';
import { SamModules } from './sam-modules.entity';
@Entity()
export class UsersSamModules extends AuditableEntity {
    @ManyToOne(
        () => User,
        user => user.samModules,
        { onDelete: 'CASCADE' }
    )
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ name: 'user_id', nullable: false })
    user_id: string;

    @ManyToOne(
        () => SamModules,
        samModule => samModule.users,
        { onDelete: 'CASCADE' }
    )
    @JoinColumn({ name: 'sam_module_id' })
    samModule: SamModules;

    @Column({ name: 'sam_module_id', nullable: false })
    sam_module_id: string;
}
