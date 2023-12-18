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

@Entity()
export class User extends AuditableEntity {
  // account > unique id generator 10 numbers)
  @Column({ length: 8, unique: true })
  account: string;

  @Column({ length: 100, unique: true })
  username: string;

  @Column({ nullable: true, length: 100 })
  first_name: string;

  @Column({ nullable: true, length: 100 })
  last_name: string;

  // @Factory((faker, ctx) => faker.internet.password())
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

  @Column({ nullable: true, length: 500 })
  fcm_token: string;

  @Column({ type: 'enum', enum: Language, default: Language.EN })
  language: Language;

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: 'set', enum: Role, default: [Role.CLIENT] })
  roles: Role[];




  @Column({ default: 0 })
  total_points: number;




  @Column({ default: true })
  notification_is_active: boolean;


  constructor(partial: Partial<User>) {
    super();
    Object.assign(this, partial);
  }

  // generate unique id in this pattern: ######
  private uniqueIdGenerator(): string {
    return randNum(8);
  }

  @BeforeInsert()
  generateAccount() {
    // ensure the account is unique
    if (!this.account) this.account = this.uniqueIdGenerator();
  }
}
