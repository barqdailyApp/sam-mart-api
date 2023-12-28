import { Expose } from "class-transformer";

export class CategoryResponse {
    @Expose()
    id: string;
    @Expose()
    category_id: string;
    @Expose()
    name:string
  
    @Expose()
    is_active: boolean;

    constructor(data:Partial<CategoryResponse>){
        console.log(data)
this.id=data.id
this.category_id=data.category_id
this.name=data.name

this.is_active=data.is_active

    }
}