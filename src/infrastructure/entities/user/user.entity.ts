import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import {
  Entity,
  Column,
  BeforeInsert,
  OneToMany,
  OneToOne,
  AfterInsert,
} from 'typeorm';
import { randNum } from 'src/core/helpers/cast.helper';
import { Gender } from 'src/infrastructure/data/enums/gender.enum';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { Language } from 'src/infrastructure/data/enums/language.enum';
import { Address } from './address.entity';

@Entity()
export class User extends AuditableEntity {
  @Column({ length: 100, unique: true })
  username: string;

  @Column({ nullable: true, length: 60 })
  password: string;

  @Column({ nullable: true, length: 100 })
  email: string;

  @Column({ nullable: true })
  email_verified_at: Date;

  @Column({ nullable: true, length: 20 })
  phone: string;

  @Column({ nullable: true })
  phone_verified_at: Date;

  @Column({ nullable: true, length: 500 })
  avatar: string;

  @Column({ nullable: true, type: 'enum', enum: Gender })
  gender: Gender;

  @Column({nullable:true})
  birth_date: string;

  @Column({default : true})
  allow_notification: boolean;

  @Column({ type: 'set', enum: Role, default: [Role.CLIENT] })
  roles: Role[];


  @OneToMany(()=>Address,address=>address.user)
  addresses:Address[]

  constructor(partial: Partial<User>) {
    super();
    Object.assign(this, partial);
  }
}
