import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Product } from './product.entity';
import { Section } from '../section/section.entity';
import { User } from '../user/user.entity';

@Entity()
export class ProductFavorite extends AuditableEntity {
  @ManyToOne(() => Product, (product) => product.products_favorite, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column()
  product_id: string;


  @ManyToOne(() => Section, (section) => section.products_favorite, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'section_id' })
  section: Section;

  @Column()
  section_id: string;


  
  @ManyToOne(() => User, (user) => user.products_favorite, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  user_id: string;
}
