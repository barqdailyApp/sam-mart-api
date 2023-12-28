import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class AdditionalService extends AuditableEntity {
  @Column()
  name_ar: string;

  @Column()
  name_en: string;
}
