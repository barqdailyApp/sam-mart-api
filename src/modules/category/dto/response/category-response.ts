import { Expose } from "class-transformer";
import { toUrl } from "src/core/helpers/file.helper";

export class CategoryResponse {
    @Expose()
    id: string;
    @Expose()
    category_id: string;
    @Expose()
    name_ar:string

    @Expose()
    name:string
    @Expose()
    order_by: number;
    @Expose()
    name_en:string
  
    @Expose()
    is_active: boolean;
    @Expose()
    logo:string
    constructor(data:Partial<CategoryResponse>){
      
this.id=data.id
this.category_id=data.category_id
this.name_ar=data.name_ar
this.name=data.name
this.name_en=data.name_en
this.logo= toUrl( data.logo)
this.is_active=data.is_active

    }
}