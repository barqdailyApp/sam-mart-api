//social link entity

import { Entity, Column, JoinColumn, OneToOne, OneToMany } from 'typeorm';
import { Transaction } from './transaction.entity';

import { User } from '../user/user.entity';
import { OwnedEntity } from 'src/infrastructure/base/owned.entity';

@Entity()
export class Wallet extends OwnedEntity {
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  balance: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  limit: number;
  //one to many relation with user
  @OneToOne(() => User, (user) => user.wallet)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Transaction, (transaction) => transaction.wallet, {
    cascade: true,
  })
  transactions: Transaction[];
  @Column({ default: 'user' })
  type: string;

  constructor(partial?: Partial<Wallet>) {
    super();
    Object.assign(this, partial);
  }
}
