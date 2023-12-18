import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Customer } from '../customer/customer.entity';
import { Biker } from '../biker/biker.entity';
import { User } from '../user/user.entity';
import { PointsType } from 'src/infrastructure/data/enums/points-type.enum';

@Entity()
export class Points extends AuditableEntity {
  @ManyToOne(() => User, (user) => user.points)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  user_id: string;

  @Column()
  points: number;


  @Column({default:PointsType.ORDER})
  type:PointsType

  constructor(partial: Partial<Points>) {
    super();
      Object.assign(this, partial);
  }
}
