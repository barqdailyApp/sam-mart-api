import { extend } from "joi";
import { BaseEntity } from "src/infrastructure/base/base.entity";
import { Column, Entity, OneToMany } from "typeorm";
import { ReturnOrderProduct } from "./return-order-product.entity";
import { AuditableEntity } from "src/infrastructure/base/auditable.entity";

@Entity()
export class ReturnProductReason extends AuditableEntity {
    @Column()
    reason: string;

    @OneToMany(
        () => ReturnOrderProduct,
        returnOrderProduct => returnOrderProduct.returnProductReason,
    )
    returnOrderProducts: ReturnOrderProduct[];
}