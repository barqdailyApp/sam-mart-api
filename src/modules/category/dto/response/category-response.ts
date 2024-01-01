import { Expose } from "class-transformer";
import { toUrl } from "src/core/helpers/file.helper";

export class CategoryResponse {
    @Expose()
    id: string;
    @Expose()
    category_id: string;
    @Expose()
    name:string
  
    @Expose()
    is_active: boolean;
    @Expose()
    logo:string
    constructor(data:Partial<CategoryResponse>){
      
this.id=data.id
this.category_id=data.category_id
this.name=data.name
this.logo= toUrl( data.logo)
this.is_active=data.is_active

    }
}