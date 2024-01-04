import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { ProductAdditionalService } from './product-additional-service.entity';

@Entity()
export class AdditionalService extends AuditableEntity {
  @Column()
  name_ar: string;

  @Column()
  name_en: string;

  @OneToMany(
    () => ProductAdditionalService,
    (productService) => productService.additional_service,
  )
  product_services: ProductAdditionalService[];
}
