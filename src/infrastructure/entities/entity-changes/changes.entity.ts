import { Column, Entity } from 'typeorm';
import { AuditableEntity } from '../../base/auditable.entity';

@Entity()
export class EntityChanges extends AuditableEntity {
  @Column()
  entity_name: string;

  @Column()
  row_id: string;

  @Column()
  user_id: string;
}
