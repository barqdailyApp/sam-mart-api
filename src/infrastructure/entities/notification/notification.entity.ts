import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import { OwnedEntity } from 'src/infrastructure/base/owned.entity';
import { User } from 'src/infrastructure/entities/user/user.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity()
export class NotificationEntity extends AuditableEntity {
  //type
  @Column({ default: 'COMMON' })
  type: string;

  @Column({ nullable: true })
  url: string;
  //is read
  @Column({ type: Boolean, default: false })
  is_read: boolean;

  //seen-at
  @Column({ nullable: true })
  seen_at: Date;

  @Column({ nullable: true })
  title_ar: string;

  @Column({ nullable: true })
  title_en: string;

  //text-ar
  @Column({ nullable: true })
  text_ar: string;

  //text-en
  @Column({ nullable: true })
  text_en: string;

  @ManyToOne(() => User, (user) => user.notifications, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  user_id: string;

  constructor(partial: Partial<NotificationEntity>) {
    super();
    Object.assign(this, partial);
  }
}
