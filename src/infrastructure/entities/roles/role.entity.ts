import { Column, Entity, OneToMany } from 'typeorm';
import { Permissions } from './premissions.entity';
import { BaseEntity } from 'src/infrastructure/base/base.entity';

@Entity()
export class Role extends BaseEntity {
  @OneToMany(() => Permissions, (permission) => permission.role)
  permission: Permissions[];
  @Column()
  role: string;
}
