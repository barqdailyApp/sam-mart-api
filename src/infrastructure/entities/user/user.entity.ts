import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import {
  Entity,
  Column,
  BeforeInsert,
  OneToMany,
  OneToOne,
  AfterInsert,
  ManyToOne,
  JoinColumn,

} from 'typeorm';
import { randNum } from 'src/core/helpers/cast.helper';
import { Gender } from 'src/infrastructure/data/enums/gender.enum';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { Language } from 'src/infrastructure/data/enums/language.enum';
import { Address } from './address.entity';
import { SupportTicket } from '../support-ticket/support-ticket.entity';
import { TicketComment } from '../support-ticket/ticket-comment.entity';
import { Transaction } from '../wallet/transaction.entity';
import { Order } from '../order/order.entity';
import { ProductFavorite } from '../product/product-favorite.entity';
import { ShipmentChat } from '../order/shipment-chat.entity';
import { ShipmentFeedback } from '../order/shipment-feedback.entity';
import { Wallet } from '../wallet/wallet.entity';
import { NotificationEntity } from '../notification/notification.entity';
import { UserStatus } from 'src/infrastructure/data/enums/user-status.enum';
import { PromoCode } from '../promo-code/promo-code.entity';
import { SamModules } from '../sam-modules/sam-modules.entity';
import { UsersSamModules } from '../sam-modules/users-sam-modules.entity';
import { ShipmentProductHistory } from '../order/shipment-product-history.entity';
import { OrderHistory } from '../order/order-history.entity';
import { Restaurant } from '../restaurant/restaurant.entity';
import { RestaurantOrder } from '../restaurant/order/restaurant_order.entity';

@Entity()
export class User extends AuditableEntity {
  @Column({ length: 100, unique: true })
  username: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true, length: 60 })
  password: string;

  @Column({ nullable: true, length: 100 })
  email: string;

  @Column({ nullable: true })
  email_verified_at: Date;



  @OneToOne(() => Wallet, (wallet) => wallet.user)
  wallet: Wallet;
  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions: Transaction[]

  @Column({ nullable: true, length: 100 })
  phone: string;

  @Column({ nullable: true })
  phone_verified_at: Date;

  @Column({ nullable: true, length: 500, default: 'assets/images/avatar/male.png' })
  avatar: string;

  @Column({ nullable: true, type: 'enum', enum: Gender })
  gender: Gender;

  @Column({ nullable: true, type: 'enum', enum: UserStatus, default: UserStatus.ActiveClient, })
  user_status: UserStatus;


  @Column({ nullable: true })
  birth_date: string;

  @Column({ default: true })
  allow_notification: boolean;

  @Column({ type: 'set', enum: Role, default: [Role.CLIENT] })
  roles: Role[];

  @OneToMany(() => SupportTicket, (supportTicket) => supportTicket.user)
  support_tickets: SupportTicket[];

  @OneToMany(() => TicketComment, (ticketComment) => ticketComment.user)
  ticket_comments: TicketComment[];

  @OneToMany(() => Address, (address) => address.user)
  addresses: Address[];

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => ShipmentChat, (shipmentChat) => shipmentChat.user, {
    cascade: true,
  })
  shipment_chats: ShipmentChat[];

  @OneToMany(() => ShipmentFeedback, (orderFeedback) => orderFeedback.user)
  order_feedbacks: ShipmentFeedback[];

  @OneToMany(() => ProductFavorite, (productFavorite) => productFavorite.user)
  products_favorite: ProductFavorite[];

  @Column({ nullable: true, length: 500 })
  fcm_token: string;

  @Column({ default: true })
  notification_is_active: boolean;

  @OneToMany(() => NotificationEntity, (notification) => notification.user)
  notifications: NotificationEntity[];

  @OneToMany(
    ()=> UsersSamModules,
    user=> user.user,
    {cascade: true}
  )
  samModules: UsersSamModules[];

  @OneToMany(() => ShipmentProductHistory, (shipmentProductHistory) => shipmentProductHistory.modified_by)
  shipment_product_histories: ShipmentProductHistory[];

  @OneToMany(() => OrderHistory, (orderHistory) => orderHistory.modified_by)
  order_histories: OrderHistory[];

  @Column({ type: 'enum', enum: Language, default: Language.AR })
  language: Language;

  @OneToMany(()=>RestaurantOrder, (restaurantOrder) => restaurantOrder.user)
  restaurant_orders: RestaurantOrder[]
  constructor(partial: Partial<User>) {
    super();
    Object.assign(this, partial);
  }
}
