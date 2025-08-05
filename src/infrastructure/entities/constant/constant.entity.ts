import { BaseEntity } from 'src/infrastructure/base/base.entity';
import { ConstantType } from 'src/infrastructure/data/enums/constant-type.enum';
import {  SectionType } from 'src/infrastructure/data/enums/driver-type.eum';
import {  Column, Entity } from 'typeorm';
@Entity()
export class Constant extends BaseEntity {
  @Column()
  variable: string;
  @Column({ unique: true })
  type: ConstantType;

  @Column({ nullable: true })
  section:SectionType;
  constructor(partial?: Partial<Constant>) {
    super();
    Object.assign(this, partial);
  }
}
