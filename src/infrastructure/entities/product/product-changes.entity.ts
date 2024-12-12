import { Col } from 'sequelize/types/utils';
import { OwnedEntity } from 'src/infrastructure/base/owned.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Product } from './product.entity';
import { User } from '../user/user.entity';


@Entity()
export class ProductChanges extends OwnedEntity {
  @ManyToOne(() => User, )
  @JoinColumn({ name: 'user_id' })
  user: User;
  @ManyToOne(() => Product, (product) => product.product_changes)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column()
  product_id: string;

  @Column()
  fieldChanged: string;

  @Column({ nullable: true })
  oldValue: string;

  @Column({ nullable: true })
  newValue: string;


}
