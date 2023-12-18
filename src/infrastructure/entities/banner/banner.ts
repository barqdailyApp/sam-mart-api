import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Banner  extends AuditableEntity{
  @Column()
  name: string;

  @Column()
  image:string;

  
  @Column({nullable:true})
  order: number;

  @Column()
  end_time: Date;
}