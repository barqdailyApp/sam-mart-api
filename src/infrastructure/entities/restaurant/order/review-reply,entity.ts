import { AuditableEntity } from "src/infrastructure/base/auditable.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { RestaurantOrderReview } from "./restaurant-review.entity";
import { User } from "../../user/user.entity";

@Entity()
export class ReviewReply extends AuditableEntity {

  @ManyToOne(()=>RestaurantOrderReview,(restaurantOrderReview)=>restaurantOrderReview.replies)
  @JoinColumn()
  review:RestaurantOrderReview
  @Column()
  review_id:string

  @ManyToOne(()=>User,(user)=>user.review_replies)
  @JoinColumn()
  user:User
  @Column()
  user_id:string

  @Column()
  comment:string


}