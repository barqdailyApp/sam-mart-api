import { AuditableEntity } from "src/infrastructure/base/auditable.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { Cart } from "./cart.entity";
import { ProductCategoryPrice } from "../product/product-category-price.entity";

@Entity()

export class CartProduct extends AuditableEntity{

@ManyToOne(() => Cart,cart=>cart.products)
@JoinColumn()
cart:Cart   

@Column()
cart_id:string

@Column()
quantity:number


@ManyToOne(() => ProductCategoryPrice, (productCategoryPrice) => productCategoryPrice.cart_products)
@JoinColumn()
product_category_price:ProductCategoryPrice

@Column()
product_category_price_id:string


@Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
price:number;

constructor(data: Partial<CartProduct>) {
    super();
    Object.assign(this, data);
}

}