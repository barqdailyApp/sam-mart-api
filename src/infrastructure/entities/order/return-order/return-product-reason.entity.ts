import { extend } from "joi";
import { BaseEntity } from "src/infrastructure/base/base.entity";
import { Column, Entity, OneToMany } from "typeorm";
import { ReturnOrderProduct } from "./return-order-product.entity";

@Entity()
export class ReturnProductReason extends BaseEntity {
    @Column()
    reason: string;

    @OneToMany(
        () => ReturnOrderProduct,
        returnOrderProduct => returnOrderProduct.returnProductReason,
    )
    returnOrderProducts: ReturnOrderProduct[];
}