import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';

import { User } from '../user/user.entity';
import { OwnedEntity } from 'src/infrastructure/base/owned.entity';
import { Package } from '../package/package.entity';
import { Customer } from '../customer/customer.entity';
import { PromoCode } from '../promo-code/promo-code.entity';
import { Subscription } from '../subscription/subscription.entity';

@Entity()
export class Gift extends AuditableEntity {
  @ManyToOne(() => Customer, (customer) => customer.gifts_sender)
  @JoinColumn({ name: 'sender_id' })
  sender: Customer;

  @Column()
  sender_id: string;

  @ManyToOne(() => Customer, (customer) => customer.gifts_receiver)
  @JoinColumn({ name: 'receiver_id' })
  receiver: Customer;

  @Column()
  receiver_id: string;

  @OneToOne(() => Subscription)
  @JoinColumn({ name: 'subscription_id' })
  subscription: Subscription;

  @Column()
  subscription_id: string;

  @Column()
  message: string;
}
