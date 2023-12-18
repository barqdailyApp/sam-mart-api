import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import {
  Entity,
  ManyToOne,
  Column,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Vehicle } from './vehicle.entity';

@Entity()
export class VehicleImage extends AuditableEntity {
  @ManyToOne(() => Vehicle, (vehicle) => vehicle.images, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @Column()
  vehicle_id: string;

  @Column({ length: 500 })
  image: string;

  @CreateDateColumn()
  created_at: Date;

  constructor(partial?: Partial<VehicleImage>) {
    super();
    Object.assign(this, partial);
  }
}
