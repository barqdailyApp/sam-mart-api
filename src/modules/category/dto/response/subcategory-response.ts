import { Expose } from "class-transformer";

export class SubcategoryResponse {
    @Expose()
    id: string;
    @Expose()
    sub_category_id: string;
    @Expose()
    name:string
 
    @Expose()
    is_active: boolean;

    constructor(data:Partial<SubcategoryResponse>){
       
this.id=data.id
this.sub_category_id=data.sub_category_id
this.name=data.name

this.is_active=data.is_active

    }
}