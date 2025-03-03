import { AuditableEntity } from "src/infrastructure/base/auditable.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { User } from "../../user/user.entity";
import { RestaurantOrder } from "./restaurant_order.entity";
import { ReviewReply } from "./review-reply,entity";
@Entity()
export class RestaurantOrderReview extends AuditableEntity {

  @ManyToOne(()=>User,user=>user.restaurant_order_feedbacks)
  @JoinColumn()
  user:User  
  @Column()
  user_id:string
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  rating: number;

  @Column({nullable:true})
  comment:string

  @ManyToOne(()=>RestaurantOrder,(restaurantOrder)=>restaurantOrder.reviews,{onDelete:'CASCADE'})
  @JoinColumn({name:'restaurant_order_id'})
  restaurant_order:RestaurantOrder

  @OneToMany(()=>ReviewReply,(reviewReply)=>reviewReply.review,{onDelete:'CASCADE'})
  replies:ReviewReply[]
}