import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from 'src/infrastructure/base/base.entity';

@Entity()
export class SocialMedia extends BaseEntity {
  @Column({ unique: true })
  icon: string;

  @Column({ unique: true })
  link: string;

  @Column({ unique: true })
  scheme: string;
}
