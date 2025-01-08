import { AuditableEntity } from "src/infrastructure/base/auditable.entity";
import { RestaurantAttachmentEnum } from "src/infrastructure/data/enums/restaurant-attachment.enum";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { Restaurant } from "./restaurant.entity";
@Entity()
export class RestaurantAttachment  extends AuditableEntity{
    @Column()
    url: string

    @Column({
        type: "enum",
        enum: RestaurantAttachmentEnum
    })
    type: RestaurantAttachmentEnum

    @ManyToOne(() => Restaurant, (restaurant) => restaurant.attachments)
    @JoinColumn()
    restaurant: Restaurant

    constructor(data:Partial<RestaurantAttachment>){ 
        super();    
        Object.assign(this, data);
    }
}