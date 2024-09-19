import { BaseEntity } from "src/infrastructure/base/base.entity";
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne } from "typeorm";
import { WarehouseOperations } from "./warehouse-opreations.entity";
import { Product } from "../product/product.entity";

@Entity()
export class WarehouseOpreationProducts extends BaseEntity {
    // @ManyToOne(() => Product, (product) => product.warehouse_operations_products, {
    //     onDelete: 'CASCADE',
    // })
    // @JoinColumn()
    // product: Product;
    @Column({ nullable: true })
    product_id: string;
    @Column()
    product_measurement_id: string
    @Column()
    quantity: number;

    @ManyToOne(() => WarehouseOperations, (operation) => operation.products, {
        onDelete: 'CASCADE',
    })
    @JoinColumn()
    operation: WarehouseOperations;
    @Column()
    operation_id: string


    constructor(data: Partial<WarehouseOpreationProducts>) {
        super();
        Object.assign(this, data);
    }
}