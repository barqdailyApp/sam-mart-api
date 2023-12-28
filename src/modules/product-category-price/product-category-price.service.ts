import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductCategoryPrice } from 'src/infrastructure/entities/product/product-category-price.entity';
import { Repository } from 'typeorm';
import { CreateProductCategoryPriceTransaction } from './utils/create-product-category-price.transaction';
import { CreateProductCategoryPriceRequest } from './dto/request/create-product-category-price.request';
import { UpdateProductCategoryPriceTransaction } from './utils/update-product-category-price.transaction';
import { UpdateProductCategoryPriceRequest } from './dto/request/update-product-category-price.request';

@Injectable()
export class ProductCategoryPriceService {
  constructor(
    @InjectRepository(ProductCategoryPrice)
    private productCategoryPrice: Repository<ProductCategoryPrice>,
    @Inject(CreateProductCategoryPriceTransaction)
    private readonly createProductCategoryPriceTransactionTransaction: CreateProductCategoryPriceTransaction,
    @Inject(UpdateProductCategoryPriceTransaction)
    private readonly updateProductCategoryPriceTransaction: UpdateProductCategoryPriceTransaction,
  ) {}

  async findAll(): Promise<ProductCategoryPrice[]> {
    return this.productCategoryPrice.find({
      relations: {
        product_measurement:true
      },
    });
  }

  async create(
    createProductCategoryPriceRequest: CreateProductCategoryPriceRequest,
  ) {
    return this.createProductCategoryPriceTransactionTransaction.run(
      createProductCategoryPriceRequest,
    );
  }
  async update(
    updateProductCategoryPriceRequest: UpdateProductCategoryPriceRequest,
  ) {
    return this.createProductCategoryPriceTransactionTransaction.run(
      updateProductCategoryPriceRequest,
    );
  }
}
