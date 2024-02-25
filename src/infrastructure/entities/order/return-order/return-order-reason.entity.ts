import { extend } from "joi";
import { BaseEntity } from "src/infrastructure/base/base.entity";
import { Column, Entity, OneToMany } from "typeorm";
import { ReturnOrderProduct } from "./return-order-product.entity";

@Entity()
export class ReturnOrderReason extends BaseEntity {
    @Column()
    reason: string;

    @OneToMany(
        () => ReturnOrderProduct,
        returnOrderProduct => returnOrderProduct.returnOrderReason,
        { onDelete: 'SET NULL' }
    )
    returnOrderProducts: ReturnOrderProduct[];
}