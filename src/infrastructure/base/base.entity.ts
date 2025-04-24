import { Expose } from 'class-transformer';
import {
    Entity,
    PrimaryColumn,
    BaseEntity as TypeORMBaseEntity,
} from 'typeorm';

@Entity()
export abstract class BaseEntity extends TypeORMBaseEntity {
  @Expose()
    @PrimaryColumn({ generated: 'uuid', nullable: false, length: 36, type: 'varchar' })
  id!: string;
}