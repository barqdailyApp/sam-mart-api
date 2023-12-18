import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import { Entity, Column, OneToMany } from 'typeorm';
import { VehicleBrandModel } from './vehicle-brand-model.entity';

@Entity()
export class VehicleBrand extends AuditableEntity {
    @Column({ default: 0 })
    display_order: number;

    @Column({ length: 100 })
    name_en: string;

    @Column({ length: 100 })
    name_ar: string;

    @Column({ length: 500 })
    logo: string;

    @Column({ default: true })
    is_active: boolean;

    @OneToMany(() => VehicleBrandModel, (vehicleBrandModel) => vehicleBrandModel.brand)
    models: VehicleBrandModel[];

    constructor(partial: Partial<VehicleBrand>) {
        super();
        Object.assign(this, partial);
    }
}