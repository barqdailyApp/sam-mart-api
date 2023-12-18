import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity } from 'src/infrastructure/base/base.entity';
import { ReportAbuse } from './report_abuse.entity';
import { Order } from '../order/order.entity';

@Entity()
export class CancelReasons extends BaseEntity {
  @Column()
  reason_en: string;
  @Column()
  reason_ar: string;
  
  // @OneToOne(() => ReportAbuse, (reportAbuse) => reportAbuse.cancel_reason,{nullable:true} )
  // report_abuse: ReportAbuse;



  @OneToMany(() => ReportAbuse, (reportAbuse) => reportAbuse.cancel_reason)
  report_abuse: ReportAbuse[];
  



}
