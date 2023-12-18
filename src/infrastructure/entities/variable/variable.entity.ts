import { BaseEntity } from "src/infrastructure/base/base.entity";
import { variableTypes } from "src/infrastructure/data/enums/variable.enum";
import {  Column, Entity } from "typeorm";

@Entity()

export class Variable extends BaseEntity {

  @Column()
  variable:string 
  
  @Column({unique:true})
  type:variableTypes

  constructor(data:Partial<Variable>){
      super();
    Object.assign(this,data)
  }
    
}