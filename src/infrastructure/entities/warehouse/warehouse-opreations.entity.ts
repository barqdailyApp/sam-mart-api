import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { Warehouse } from "./warehouse.entity";
import { AuditableEntity } from "src/infrastructure/base/auditable.entity";
import { User } from "../user/user.entity";
import { OwnedEntity } from "src/infrastructure/base/owned.entity";
import { Product } from "../product/product.entity";
import { operationType } from "src/infrastructure/data/enums/operation-type.enum";
import { WarehouseOpreationProducts } from "./wahouse-opreation-products.entity";

@Entity()

export class WarehouseOperations extends OwnedEntity {
@ManyToOne(() => Warehouse, (warehouse) => warehouse.operations, {
    onDelete: 'CASCADE',
  })
@JoinColumn()
    warehouse: Warehouse;
@Column()
warehouse_id: string;

// @OneToMany(() => WarehouseOpreationProducts, (product) => product.operation, {
//     cascade: true,
// })
// products: WarehouseOpreationProducts[]

@Column({type:'enum',enum:operationType})
type:operationType

constructor(data: Partial<WarehouseOperations>) {
    super();
    Object.assign(this, data);
} 
}