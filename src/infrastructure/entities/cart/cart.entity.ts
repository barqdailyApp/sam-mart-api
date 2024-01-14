import { AuditableEntity } from "src/infrastructure/base/auditable.entity";
import { Entity, OneToMany, OneToOne } from "typeorm";
import { User } from "../user/user.entity";
import { OwnedEntity } from "src/infrastructure/base/owned.entity";
import { CartProduct } from "./cart-products";

@Entity()

export class Cart extends OwnedEntity{
@OneToOne(() => User)
user:User


@OneToMany(()=>CartProduct,cartProduct=>cartProduct.cart)
products:CartProduct[]


constructor(data: Partial<Cart>) {
    super();
    Object.assign(this, data);
}

}