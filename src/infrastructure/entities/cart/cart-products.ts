import { AuditableEntity } from "src/infrastructure/base/auditable.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { Cart } from "./cart.entity";
import { ProductCategoryPrice } from "../product/product-category-price.entity";
import { Col } from "sequelize/types/utils";

@Entity()

export class CartProduct extends AuditableEntity{

@ManyToOne(() => Cart,cart=>cart.products)
@JoinColumn()
cart:Cart   

@Column()
cart_id:string

@Column()
product_id:string

@Column({nullable:true})
section_id:string

@Column()
quantity:number

@Column()
main_measurement_id:string

@Column()
conversion_factor :number

@ManyToOne(() => ProductCategoryPrice, (productCategoryPrice) => productCategoryPrice.cart_products)
@JoinColumn()
product_category_price:ProductCategoryPrice

@Column()
product_category_price_id:string


@Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
price:number;

@Column({type:"simple-array",nullable:true})
additions:string[]

constructor(data: Partial<CartProduct>) {
    super();
    Object.assign(this, data);
}

}