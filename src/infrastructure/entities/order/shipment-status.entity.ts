import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Order } from './order.entity';
import { Shipment } from './shipment.entity';
import { ShipmentStatusEnum } from 'src/infrastructure/data/enums/shipment_status.enum';
@Entity()
export class ShipmentStatus extends AuditableEntity {
  @Column()
  status: ShipmentStatusEnum;

  @Column()
  is_current: boolean;

  @ManyToOne(() => Shipment, (shipment) => shipment.status)
  @JoinColumn()
  shipment: Shipment;
  @Column()
  shipment_id: string;
}
