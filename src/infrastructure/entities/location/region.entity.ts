import { Column, Entity } from 'typeorm';
import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';

@Entity()
export class Region extends AuditableEntity {
    @Column({ unique: true })
    name_ar: string;
  
    @Column({ unique: true })
    name_en: string;
}
