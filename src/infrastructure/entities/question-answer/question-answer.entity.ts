import { OwnedEntity } from 'src/infrastructure/base/owned.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { User } from '../user/user.entity';
import { BaseEntity } from 'src/infrastructure/base/base.entity';

@Entity()
export class QuestionAndAnswer extends BaseEntity {
  @Column({type:"longtext"})
  question_ar: string;

  @Column({type:"longtext"})
  answer_ar: string;

  @Column({type:"longtext"})
  question_en: string;

  @Column({type:"longtext"})
  answer_en: string;

}
