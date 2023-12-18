import { AuditableEntity } from "src/infrastructure/base/auditable.entity";
import { BeforeInsert, BeforeUpdate, Column, Entity } from "typeorm";

@Entity()

export class WorkingArea extends AuditableEntity {

    
@Column({default:true})
active:boolean    
// geometry column
@Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  location: string;

  // latitude

  @Column({ type: 'float', precision: 10, scale: 6 })
  latitude: number;

  // longitude
 
  @Column({ type: 'float', precision: 11, scale: 6 })
  longitude: number;
 
  @Column()
  range:number
  
  @BeforeInsert()
  saveLocation() {
    this.location = `POINT(${this.latitude} ${this.longitude})`;
  }

  @BeforeUpdate()
  updateLocation() {
    this.location = `POINT(${this.latitude} ${this.longitude})`;
  }
 
}