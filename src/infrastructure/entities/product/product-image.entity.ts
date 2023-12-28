import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Product } from './product.entity';

@Entity()
export class ProductImage extends AuditableEntity {
  @Column()
  url: string;

  @ManyToOne(() => Product, (product) => product.product_images, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column()
  product_id: string;
}
