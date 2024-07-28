import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { SamModules } from './sam-modules.entity';

@Entity()
export class SamModulesEndpoints extends AuditableEntity {
    @Column()
    endpoint: string;

    @Column()
    method: string;

    @Column({ nullable: true })
    description: string;

    @ManyToOne(
        () => SamModules,
        samModule => samModule.samModuleEndpoints,
        { onDelete: 'CASCADE' }
    )
    @JoinColumn({ name: 'sam_module_id' })
    samModule: SamModules;

    @Column({ name: 'sam_module_id', nullable: false })
    sam_module_id: string;
}
