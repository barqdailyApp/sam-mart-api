import { Column, Entity, OneToMany } from 'typeorm';

import { BaseEntity } from 'src/infrastructure/base/base.entity';
import { SocialMedia } from '../social-media/social-media.entity';

@Entity()
export class AppConstants extends BaseEntity {

    @Column()
    logo_app: string;

    @Column()
    company_address: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    tax_rate: number; 

    @Column()
    vat_number: string;

    @Column()
    biker_wash_point: number; 

    @Column()
    client_wash_point: number; 

    @Column()
    redeemable_points: number; 

    @Column()
    reschadule_time: number; 

    @Column()
    wash_time: number; 

    @Column()
    biker_arrival_time: number; 
}
