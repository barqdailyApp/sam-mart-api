import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/infrastructure/entities/product/product.entity';
import { DeleteResult, Repository } from 'typeorm';
import { CreateProductRequest } from './dto/request/create-product.request';
import { AddProductTransaction } from './utils/add-product.transaction';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @Inject(AddProductTransaction)
    private readonly addProductTransaction: AddProductTransaction,
  ) {}

  async create(createProductRequest: CreateProductRequest): Promise<Product> {
    return await this.addProductTransaction.run(createProductRequest);
  }
  async findAll(): Promise<Product[]> {
    return await this.productRepository.find({
      relations: { product_images: true, product_measurements: {
        measurement_unit: true
      }  },
    });
  }
  async single(product_id: string): Promise<Product> {
    return await this.productRepository.findOne({
      where: { id: product_id },
      relations: { product_images: true, product_measurements: {
        measurement_unit: true
      } },
    });
  }
  async delete(product_id: string): Promise<DeleteResult> {
    await this.single(product_id);
    return await this.productRepository.delete({ id: product_id });
  }
}
