import {
    Entity,
    Column,
} from 'typeorm';
import { AuditableEntity } from './auditable.entity';

@Entity()
export abstract class OwnedEntity extends AuditableEntity {
    @Column({nullable:true})
    user_id: string;
}