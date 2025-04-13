
import { AuditableEntity } from "src/infrastructure/base/auditable.entity";
import { TransactionTypes } from "src/infrastructure/data/enums/transaction-types";
import { Entity, Column, ManyToOne, JoinColumn, BeforeInsert } from "typeorm";
import { User } from "../user/user.entity";
import { Wallet } from "./wallet.entity";
import { Order, } from "../order/order.entity";
import { randNum } from "src/core/helpers/cast.helper";
import { RestaurantOrder } from "../restaurant/order/restaurant_order.entity";


@Entity()
export class Transaction extends AuditableEntity {
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amount: number;

  @ManyToOne(() => Wallet, (wallet) => wallet.transactions)
  @JoinColumn({ name: 'wallet_id' })
  wallet: Wallet;

  @Column()
  wallet_id: string;

  @Column({ default: TransactionTypes.OTHER })
  type: TransactionTypes;

  @ManyToOne(() => Order, (order) => order.transactions)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => RestaurantOrder, )
  @JoinColumn()
  restaurant_order: Order;

  @Column({nullable:true})
  restaurant_order_id: string;

  @Column({ nullable: true })
  order_id: string;
  @ManyToOne(() => User, (user) => user.transactions)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({nullable:true})
  user_id: string;

  @Column({nullable:true})
  note: string;
  
  @Column({ length: 8, unique: true })
  number: string;


  constructor(partial?: Partial<Transaction>) {
    super();
    Object.assign(this, partial);
  }
  public uniqueIdGenerator(): string {
    return randNum(8);  
  }
  @BeforeInsert()
  generateAccount() {
    // ensure the account is unique
    if (!this.number) this.number = this.uniqueIdGenerator();
  }
}
