import { Column, Entity, OneToMany } from 'typeorm';

import { BaseEntity } from 'src/infrastructure/base/base.entity';
import { SocialMedia } from '../social-media/social-media.entity';

@Entity()
export class AboutUs extends BaseEntity {
  @Column()
  title_ar: string;

  @Column()
  title_en: string;

  @Column({type:"longtext"})
  description_ar: string;

  @Column({type:"longtext"})
  description_en: string;

  @Column()
  background_image_url: string;

}
