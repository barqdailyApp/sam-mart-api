import { BaseEntity } from "src/infrastructure/base/base.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { Product } from "../product/product.entity";
import { Warehouse } from "./warehouse.entity";
import { ProductMeasurement } from "../product/product-measurement.entity";

@Entity()

export class WarehouseProducts extends BaseEntity {

 @ManyToOne(() => Warehouse, (warehouse) => warehouse.products)
 @JoinColumn()
 warehouse: Warehouse;
 @Column()
 warehouse_id: string;

 @ManyToOne(() => Product, (product) => product.warehouses)
 @JoinColumn()
 product: Product;

 @Column()
 product_id: string;

 @Column()
 quantity: number;

@ManyToOne(() => ProductMeasurement, (productMeasurement) => productMeasurement.warehouses)
@JoinColumn()
product_measurement: ProductMeasurement

@Column()
product_measurement_id: string

constructor(data: Partial<WarehouseProducts>)
{
    super();
    Object.assign(this, data);
}
}