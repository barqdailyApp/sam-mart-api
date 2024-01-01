import { Expose } from "class-transformer";
import { toUrl } from "src/core/helpers/file.helper";

export class SubcategoryResponse {
    @Expose()
    id: string;
    @Expose()
    sub_category_id: string;
    @Expose()
    name:string
 
    @Expose()
    is_active: boolean;

    @Expose()
    logo:string

    constructor(data:Partial<SubcategoryResponse>){
       
this.id=data.id
this.sub_category_id=data.sub_category_id
this.name=data.name
this.logo= toUrl( data.logo)
this.is_active=data.is_active

    }
}