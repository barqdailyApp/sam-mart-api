import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Order } from '../order/order.entity';
import { User } from '../user/user.entity';
import { SamModulesEndpoints } from './sam-modules-endpoints.entity';
import { UsersSamModules } from './users-sam-modules.entity';
@Entity()
export class SamModules extends AuditableEntity {
    @Column()
    name_en: string;

    @Column()
    name_ar: string;

    @OneToMany(
        () => SamModulesEndpoints,
        samModuleEndpoints => samModuleEndpoints.samModule,
        { cascade: true }
    )
    samModuleEndpoints: SamModulesEndpoints[];

    @OneToMany(
        () => UsersSamModules,
        user => user.samModule,
        { cascade: true }
    )
    users: User[];
}
