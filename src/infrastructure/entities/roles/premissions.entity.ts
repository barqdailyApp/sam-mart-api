import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Role } from './role.entity';
import { BaseEntity } from 'src/infrastructure/base/base.entity';

@Entity()
export class Permissions extends BaseEntity {
  permission: string;

  @ManyToOne(() => Role, (role) => role.permission)
  @JoinColumn()
  role: Permissions[];
}
