import { Inject, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseService } from "src/core/base/service/service.base";
import { Brand } from "src/infrastructure/entities/brand/brand";
import { Product } from "src/infrastructure/entities/product/product.entity";
import { Repository } from "typeorm";

export class BrandService extends BaseService<Brand>{
    constructor(@InjectRepository (Brand) private readonly brand_repo: Repository<Brand>,
@InjectRepository(Product) private readonly product_repo: Repository<Product>){
        super(brand_repo);{
        
    }
}
async linkBrandToProduct(brand_id:string,product_id:string){
    const brand = await this.brand_repo.findOne({where:{id:brand_id}})
    if (!brand) {
        throw new NotFoundException("brand not found");
    }

    const product = await this.product_repo.findOne({where:{id:product_id}})
    if (!product) {
        throw new NotFoundException("product not found");
    }

    product.brand_id = brand.id
 return    await this.product_repo.save(product)

}}