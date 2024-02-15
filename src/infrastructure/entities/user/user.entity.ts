import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import {
  Entity,
  Column,
  BeforeInsert,
  OneToMany,
  OneToOne,
  AfterInsert,
} from 'typeorm';
import { randNum } from 'src/core/helpers/cast.helper';
import { Gender } from 'src/infrastructure/data/enums/gender.enum';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { Language } from 'src/infrastructure/data/enums/language.enum';
import { Address } from './address.entity';
import { SupportTicket } from '../support-ticket/support-ticket.entity';
import { TicketComment } from '../support-ticket/ticket-comment.entity';

import { Order } from '../order/order.entity';
import { ProductFavorite } from '../product/product-favorite.entity';
import { ShipmentChat } from '../order/shipment-chat.entity';
import { ShipmentFeedback } from '../order/shipment-feedback.entity';

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

  @Column({ nullable: true, length: 20 })
  phone: string;

  @Column({ nullable: true })
  phone_verified_at: Date;

  @Column({ nullable: true, length: 500, default: 'assets/images/avatar/male.png' })
  avatar: string;

  @Column({ nullable: true, type: 'enum', enum: Gender })
  gender: Gender;

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
  constructor(partial: Partial<User>) {
    super();
    Object.assign(this, partial);
  }
}
