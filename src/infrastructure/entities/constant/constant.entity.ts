import { ConstantType } from 'src/infrastructure/data/enums/constant-type.enum';
import { BaseEntity, Column } from 'typeorm';

export class Constant extends BaseEntity {
  @Column()
  variable: string;
  @Column({ unique: true })
  type: ConstantType;

  constructor(partial?: Partial<Constant>) {
    super();
    Object.assign(this, partial);
  }
}
