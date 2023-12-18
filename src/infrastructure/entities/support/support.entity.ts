import { Column, Entity } from 'typeorm';
import { BaseEntity } from 'src/infrastructure/base/base.entity';

@Entity()
export class Support extends BaseEntity {
  @Column()
  whatsApp_phone: string;

  @Column()
  phone_number: string;

  @Column()
  mail_us: string;

}
