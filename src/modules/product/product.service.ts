import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/infrastructure/entities/product/product.entity';
import { DeleteResult, Repository } from 'typeorm';
import { CreateProductRequest } from './dto/request/create-product.request';
import { CreateProductTransaction } from './utils/create-product.transaction';
import { UpdateProductRequest } from './dto/request/update-product.request';
import { UpdateProductTransaction } from './utils/update-product.transaction';
import { ProductImage } from 'src/infrastructure/entities/product/product-image.entity';
import { ProductMeasurement } from 'src/infrastructure/entities/product/product-measurement.entity';
import { UpdateProductMeasurementTransaction } from './utils/update-product-measurment.transaction';
import { UpdateProductMeasurementRequest } from './dto/request/update-product-measurement.request';
import { UpdateProductImageTransaction } from './utils/update-product-image.transaction';
import { UpdateProductImageRequest } from './dto/request/update-product-image.request';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
    @InjectRepository(ProductMeasurement)
    private readonly productMeasurementRepository: Repository<ProductMeasurement>,

    @Inject(CreateProductTransaction)
    private readonly addProductTransaction: CreateProductTransaction,

    @Inject(UpdateProductTransaction)
    private readonly updateProductTransaction: UpdateProductTransaction,

    @Inject(UpdateProductMeasurementTransaction)
    private readonly updateProductMeasurementTransaction: UpdateProductMeasurementTransaction,

    @Inject(UpdateProductImageTransaction)
    private readonly updateProductImageTransaction: UpdateProductImageTransaction,
  ) {}

  async create(createProductRequest: CreateProductRequest): Promise<Product> {
    return await this.addProductTransaction.run(createProductRequest);
  }

  async updateProduct(
    updateProductRequest: UpdateProductRequest,
  ): Promise<Product> {
    return await this.updateProductTransaction.run(updateProductRequest);
  }
  async updateProductMeasurement(
    updateProductMeasurementRequest: UpdateProductMeasurementRequest,
  ): Promise<Product> {
    return await this.updateProductMeasurementTransaction.run(
      updateProductMeasurementRequest,
    );
  }
  async updateProductImage(
    updateProductImageRequest: UpdateProductImageRequest,
  ): Promise<Product> {
    return await this.updateProductImageTransaction.run(
      updateProductImageRequest,
    );
  }

  async findAll(): Promise<Product[]> {
    return await this.productRepository.find({
      relations: {
        product_images: true,
        product_measurements: {
          measurement_unit: true,
        },
      },
    });
  }
  async singleProduct(product_id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id: product_id },
      relations: {
        product_images: true,
        product_measurements: {
          measurement_unit: true,
        },
      },
    });
    if (!product) {
      throw new NotFoundException('message.product_not_found');
    }
    return product;
  }
  async singleProductImage(
    product_id: string,
    image_id: string,
  ): Promise<ProductImage> {
    await this.singleProduct(product_id);

    const productImage = await this.productImageRepository.findOne({
      where: { id: image_id },
    });
    if (!productImage) {
      throw new NotFoundException('message_product_image_not_found');
    }
    return productImage;
  }
  async SingleProductMeasurement(
    product_id: string,
    measurement_id: string,
  ): Promise<ProductMeasurement> {
    await this.singleProduct(product_id);

    const productMeasurement = await this.productMeasurementRepository.findOne({
      where: { id: measurement_id },
    });
    if (!productMeasurement) {
      throw new NotFoundException('Product Measurement not found');
    }
    return productMeasurement;
  }

  async deleteProduct(product_id: string): Promise<DeleteResult> {
    await this.singleProduct(product_id);
    return await this.productRepository.delete({ id: product_id });
  }

  async deleteProductImage(
    product_id: string,
    image_id: string,
  ): Promise<DeleteResult> {
    const product = await this.singleProduct(product_id);
    if (product.product_images.length == 1) {
      throw new NotFoundException('There must be at least one photo');
    }
    await this.singleProductImage(product_id, image_id);
    return await this.productImageRepository.delete({ id: image_id });
  }

  async deleteProductMeasurement(
    product_id: string,
    measurement_id: string,
  ): Promise<DeleteResult> {
    await this.singleProduct(product_id);
    const measurement = await this.SingleProductMeasurement(
      product_id,
      measurement_id,
    );
    if (measurement.base_unit_id != null) {
      throw new NotFoundException(
        'There must be at least one main measurement',
      );
    }
    return await this.productMeasurementRepository.delete({
      id: measurement_id,
    });
  }
}
