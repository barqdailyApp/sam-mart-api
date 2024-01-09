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
import { ProductFilter } from './dto/filter/product.filter';
import { Subcategory } from 'src/infrastructure/entities/category/subcategory.entity';
import { ProductSubCategory } from 'src/infrastructure/entities/product/product-sub-category.entity';
import { MostHitSubcategory } from 'src/infrastructure/entities/category/most-hit-subcategory.entity';
import { ProductOffer } from 'src/infrastructure/entities/product/product-offer.entity';
import { CreateProductOfferRequest } from './dto/request/create-product-offer.request';
import { CategorySubCategory } from 'src/infrastructure/entities/category/category-subcategory.entity';
import { Warehouse } from 'src/infrastructure/entities/warehouse/warehouse.entity';
import { SingleProductRequest } from './dto/request/single-product.request';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
    @InjectRepository(ProductMeasurement)
    private readonly productMeasurementRepository: Repository<ProductMeasurement>,
    @InjectRepository(CategorySubCategory)
    private readonly categorySubcategory_repo: Repository<CategorySubCategory>,
    @InjectRepository(MostHitSubcategory)
    private readonly mostHitSubcategoryRepository: Repository<MostHitSubcategory>,

    @InjectRepository(ProductSubCategory)
    private readonly productSubCategory_repo: Repository<ProductSubCategory>,

    @InjectRepository(ProductOffer)
    private productOffer_repo: Repository<ProductOffer>,

    @InjectRepository(Warehouse)
    private readonly warehouse_repo: Repository<Warehouse>,

    @Inject(CreateProductTransaction)
    private readonly addProductTransaction: CreateProductTransaction,

    @Inject(UpdateProductTransaction)
    private readonly updateProductTransaction: UpdateProductTransaction,

    @Inject(UpdateProductMeasurementTransaction)
    private readonly updateProductMeasurementTransaction: UpdateProductMeasurementTransaction,

    @Inject(UpdateProductImageTransaction)
    private readonly updateProductImageTransaction: UpdateProductImageTransaction,
  ) {}

  async createProduct(
    createProductRequest: CreateProductRequest,
  ): Promise<Product> {
    return await this.addProductTransaction.run(createProductRequest);
  }

  async createProductOffer(
    product_category_price_id: string,
    createProductOfferRequest: CreateProductOfferRequest,
  ) {
    const createProductOffer = this.productOffer_repo.create(
      createProductOfferRequest,
    );
    createProductOffer.product_category_price_id = product_category_price_id;
    return await this.productOffer_repo.save(createProductOffer);
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

  //* Get All Product In App
  async AllProduct(productFilter: ProductFilter): Promise<Product[]> {
    const { page, limit } = productFilter;

    const skip = (page - 1) * limit;

    return await this.productRepository.find({
      skip,
      take: limit,

      relations: {
        product_images: true,
        product_measurements: {
          measurement_unit: true,
        },
      },
    });
  }

  async subCategoryAllProducts(
    productFilter: ProductFilter,
    categorySubCategory_id: string,
  ): Promise<Product[]> {
    const { page, limit, userLatitude, userLongitude } = productFilter;

    const skip = (page - 1) * limit;

    //* Check if sub category exist
    const categorySubcategory = await this.categorySubcategory_repo.findOne({
      where: { id: categorySubCategory_id },
    });
    if (!categorySubcategory) {
      throw new NotFoundException(`Subcategory ID not found`);
    }
    //*TODO: add hit
    // const hitSubCategory = await this.mostHitSubcategoryRepository.findOne({
    //   where: { sub_category_id },
    // });

    // if (hitSubCategory) {
    //   await this.mostHitSubcategoryRepository.update(
    //     { sub_category_id },
    //     { current_hit: hitSubCategory.current_hit + 1 },
    //   );
    // } else {
    //   const newSubCategory = this.mostHitSubcategoryRepository.create({
    //     subcategory: subCategory,
    //     current_hit: 1,
    //   });
    //   await this.mostHitSubcategoryRepository.save(newSubCategory);
    // }
    let warehouses: Warehouse;
    if (userLatitude && userLongitude) {
      warehouses = await this.warehouse_repo
        .createQueryBuilder('warehouse')
        .orderBy(
          `ST_Distance_Sphere(
            ST_SRID(point(${userLatitude}, ${userLongitude}), 4326),
            warehouse.location
        )`,
        )
        .getOne();
    }

    return await this.productRepository.find({
      skip,
      take: limit,
      // where: {
      //   warehouses_products: {
      //     warehouse_id: warehouses.id,
      //   },
      //   product_measurements: {
      //     product_category_prices: {
      //       product_sub_category: {
      //         category_subCategory:{
      //           section_category:{
      //             section_id
      //           }
      //         }
      //       },
      //     },
      //   },
      // },
      where: {
        warehouses_products: {
          warehouse_id: warehouses?.id,
        },
        product_measurements: {
          product_category_prices: {
            product_sub_category: {
              category_sub_category_id: categorySubCategory_id,
            },
          },
        },
      },
      relations: {
        product_images: true,
        warehouses_products: true,
        product_measurements: {
          product_category_prices: {
            product_offer: true,

            product_additional_services: {
              additional_service: true,
            },
          },
          measurement_unit: true,
        },
      },
    });
  }

  async singleProduct(
    product_id: string,
    singleProductRequest: SingleProductRequest,
  ): Promise<Product> {
    const { categorySubCategory_id, userLatitude, userLongitude } =
      singleProductRequest;
    //* Check if sub category exist
    if (categorySubCategory_id) {
      const categorySubcategory = await this.categorySubcategory_repo.findOne({
        where: { id: categorySubCategory_id },
      });
      if (!categorySubcategory) {
        throw new NotFoundException(`Subcategory ID not found`);
      }
    }
    let warehouses: Warehouse;
    if (userLatitude && userLongitude) {
      warehouses = await this.warehouse_repo
        .createQueryBuilder('warehouse')
        .orderBy(
          `ST_Distance_Sphere(
            ST_SRID(point(${userLatitude}, ${userLongitude}), 4326),
            warehouse.location
        )`,
        )
        .getOne();
    }

    const product = await this.productRepository.findOne({
      where: {
        id: product_id,
        warehouses_products: {
          warehouse_id: warehouses?.id,
        },
        product_measurements: {
          product_category_prices: {
            product_sub_category: {
              category_sub_category_id: categorySubCategory_id,
            },
          },
        },
      },
      relations: {
        product_images: true,
        product_measurements: {
          product_category_prices: {
            product_offer: true,
            product_additional_services: {
              additional_service: true,
            },
          },
          measurement_unit: true,
        },
      },
    });
    if (!product) {
      throw new NotFoundException('message.product_not_found');
    }
    return product;
  }
  private async singleProductImage(
    product_id: string,
    image_id: string,
  ): Promise<ProductImage> {
    const product = await this.productRepository.findOne({
      where: { id: product_id },
    });
    if (!product) {
      throw new NotFoundException('message_product_not_found');
    }

    const productImage = await this.productImageRepository.findOne({
      where: { id: image_id },
    });
    if (!productImage) {
      throw new NotFoundException('message_product_image_not_found');
    }
    return productImage;
  }
  private async SingleProductMeasurement(
    product_id: string,
    measurement_id: string,
  ): Promise<ProductMeasurement> {
    const product = await this.productRepository.findOne({
      where: { id: product_id },
    });
    if (!product) {
      throw new NotFoundException('message_product_not_found');
    }
    const productMeasurement = await this.productMeasurementRepository.findOne({
      where: { id: measurement_id },
    });
    if (!productMeasurement) {
      throw new NotFoundException('Product Measurement not found');
    }
    return productMeasurement;
  }

  async deleteProduct(product_id: string): Promise<DeleteResult> {
    const product = await this.productRepository.findOne({
      where: { id: product_id },
    });
    if (!product) {
      throw new NotFoundException('message_product_not_found');
    }
    return await this.productRepository.delete({ id: product_id });
  }

  async deleteProductImage(
    product_id: string,
    image_id: string,
  ): Promise<DeleteResult> {
    const product = await this.productRepository.findOne({
      where: { id: product_id },
    });
    if (!product) {
      throw new NotFoundException('message_product_not_found');
    }
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
    const product = await this.productRepository.findOne({
      where: { id: product_id },
    });
    if (!product) {
      throw new NotFoundException('message_product_not_found');
    }
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
