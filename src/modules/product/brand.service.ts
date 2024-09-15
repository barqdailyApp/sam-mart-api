import { Inject, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseService } from "src/core/base/service/service.base";
import { Brand } from "src/infrastructure/entities/brand/brand";
import { Product } from "src/infrastructure/entities/product/product.entity";
import { In, Not, Repository } from "typeorm";
import { LinkBrandProuductRequest } from "./dto/request/create-brand.request";

export class BrandService extends BaseService<Brand>{
    constructor(@InjectRepository (Brand) private readonly brand_repo: Repository<Brand>,
@InjectRepository(Product) private readonly product_repo: Repository<Product>){
        super(brand_repo);{
        
    }
}
async linkBrandToProduct(req:LinkBrandProuductRequest){
    const brand = await this.brand_repo.findOne({where:{id:req.brand_id}})

    if (!brand) {
        throw new NotFoundException("brand not found");
    }

    let products = await this.product_repo.find({where:{id: In(req.product_ids)}})
    
    if (!products) {
        throw new NotFoundException("product not found");
    }

   products= products.map((product)=>{
        product.brand_id = brand.id
        return product
    })
    
 return    await this.product_repo.save(products)

}


}

