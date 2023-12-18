import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { VehicleBrand } from './vehicle-brand.entity';

@Entity()
export class VehicleBrandModel extends AuditableEntity {
    @ManyToOne(() => VehicleBrand, (vehicleBrand) => vehicleBrand.models, { cascade: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'vehicle_brand_id' })
    brand: VehicleBrand;

    @Column({ name: 'vehicle_brand_id' })
    vehicle_brand_id: string;

    @Column({ default: 0 })
    display_order: number;

    @Column({ length: 100 })
    name_en: string;

    @Column({ length: 100 })
    name_ar: string;

  
    constructor(partial: Partial<VehicleBrandModel>) {
        super();
        Object.assign(this, partial);
    }
}