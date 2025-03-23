import { AuditableEntity } from "src/infrastructure/base/auditable.entity";
import { Column, Entity, ManyToMany, ManyToOne } from "typeorm";
import { Meal } from "./meal.entity";
import { User } from "../../user/user.entity";

@Entity()
export class ClientFavoriteMeal extends AuditableEntity {

    @ManyToOne(() => Meal, )
    meal: Meal;
    @Column({ nullable: false })
    meal_id: string;
    @Column({ nullable: false })
    user_id: string;
    @ManyToOne(() => User, )
    user: User;
}