import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/infrastructure/entities/product/product.entity';
import { DeleteResult, IsNull, Not, Repository } from 'typeorm';
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
import { SubcategoryService } from '../subcategory/subcategory.service';
import { MostHitSubcategory } from 'src/infrastructure/entities/category/most-hit-subcategory.entity';
import { ProductOffer } from 'src/infrastructure/entities/product/product-offer.entity';
import { CreateProductOfferRequest } from './dto/request/create-product-offer.request';
import { CategorySubCategory } from 'src/infrastructure/entities/category/category-subcategory.entity';
import { Warehouse } from 'src/infrastructure/entities/warehouse/warehouse.entity';
import { SingleProductRequest } from './dto/request/single-product.request';
import { Console } from 'console';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
    @InjectRepository(ProductMeasurement)
    private readonly productMeasurementRepository: Repository<ProductMeasurement>,
    @InjectRepository(Subcategory)
    private subcategory_repo: Repository<Subcategory>,

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

    @Inject(SubcategoryService)
    private readonly subCategoryService: SubcategoryService,
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

  async AllProduct(productFilter: ProductFilter): Promise<Product[]> {
    const {
      page,
      limit,
      section_id,
      section_category_id,
      withPrices,
      product_name,
      withWarehouse,
      category_sub_category_id,
      latitude,
      longitude,
      withOffers,
    } = productFilter;

    const skip = (page - 1) * limit;

    let warehouse: Warehouse;
    if (latitude && longitude) {
      warehouse = await this.warehouse_repo
        .createQueryBuilder('warehouse')
        .orderBy(
          `ST_Distance_Sphere(
            ST_SRID(point(${latitude}, ${longitude}), 4326),
            warehouse.location
        )`,
        )
        .getOne();
    }

    const query = this.productRepository
      .createQueryBuilder('product')

      .leftJoinAndSelect('product.product_images', 'product_images')

      .leftJoinAndSelect('product.product_measurements', 'product_measurements')

      .leftJoinAndSelect('product.warehouses_products', 'warehouses_products')

      .leftJoin(
        'product.product_sub_categories',
        'product_sub_categories',
      )
      .leftJoin(
        'product_sub_categories.category_subCategory',
        'category_subCategory',
      )
      .leftJoin(
        'category_subCategory.section_category',
        'section_category',
      )

      .leftJoinAndSelect(
        'product_measurements.measurement_unit',
        'measurement_unit',
      )
      .leftJoinAndSelect(
        'product_measurements.product_category_prices',
        'product_category_prices',
      )
      .leftJoinAndSelect(
        'product_category_prices.product_sub_category',
        'product_sub_category',
      )
      .leftJoin(
        'product_sub_category.category_subCategory',
        'category_subCategory_price',
      )
      .leftJoin(
        'category_subCategory_price.section_category',
        'section_category_price',
      )
      .leftJoinAndSelect(
        'product_category_prices.product_offer',
        'product_offer',
      )

      .skip(skip)
      .take(limit);

    if (withPrices) {
      query.orWhere('product_category_prices.id IS NOT NULL');
    }
    if (withOffers) {
      query.orWhere('product_offer.id IS NOT NULL');
    }
    if (section_id) {
      if (withPrices) {
        query.andWhere('section_category_price.section_id = :section_id', {
          section_id,
        });
      } else {
        query.orWhere('section_category.section_id = :section_id', {
          section_id,
        });
      }
    }

    if (section_category_id) {
      if (withPrices) {
        const categorySubcategory = await this.categorySubcategory_repo.findOne(
          {
            relations: { section_category: true },
            where: { section_category: { id: section_category_id } },
          },
        );

        query.andWhere(
          'product_sub_category.category_sub_category_id = :category_sub_category_id',
          {
            category_sub_category_id: categorySubcategory.id,
          },
        );
      } else {
        query.orWhere(
          'category_subCategory.section_category_id = :section_category_id',
          {
            section_category_id,
          },
        );
      }
    }

    if (category_sub_category_id) {
      if (withPrices) {
        console.log('category_sub_category_id', category_sub_category_id);
        query.andWhere(
          'product_sub_category.category_sub_category_id = :category_sub_category_id',
          {
            category_sub_category_id,
          },
        );
      } else {
        query.orWhere('category_subCategory.id = :category_sub_category_id', {
          category_sub_category_id,
        });
      }

      const categorySubcategory = await this.categorySubcategory_repo.findOne({
        where: { id: category_sub_category_id },
      });
      if (!categorySubcategory) {
        throw new NotFoundException(`Subcategory ID not found`);
      }
      await this.subCategoryService.updateMostHitSubCategory({
        sub_category_id: categorySubcategory.subcategory_id,
      });
    }

    if (withWarehouse) {
      query.where('warehouses_products.id IS NOT NULL');
    }

    if (product_name) {
      query.andWhere('product.name_ar like :product_name', {
        product_name: `%${product_name}%`,
      });
      query.orWhere('product.name_en like :product_name', {
        product_name: `%${product_name}%`,
      });
    }

    if (warehouse) {
      query.orWhere('warehouses_products.warehouse_id = :warehouse', {
        warehouse: warehouse.id,
      });
    }

    return await query.getMany();
  }

  async subCategoryAllProducts(
    productFilter: ProductFilter,
    categorySubCategory_id: string,
  ): Promise<Product[]> {
    const {
      page,
      limit,
      latitude: userLatitude,
      longitude: userLongitude,
    } = productFilter;

    const skip = (page - 1) * limit;

    //* Check if sub category exist
    const categorySubcategory = await this.categorySubcategory_repo.findOne({
      where: { id: categorySubCategory_id },
    });
    if (!categorySubcategory) {
      throw new NotFoundException(`Subcategory ID not found`);
    }

    await this.subCategoryService.updateMostHitSubCategory({
      sub_category_id: categorySubcategory.subcategory_id,
    });

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
    const { categorySubCategory_id, latitude, longitude } =
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
    if (latitude && longitude) {
      warehouses = await this.warehouse_repo
        .createQueryBuilder('warehouse')
        .orderBy(
          `ST_Distance_Sphere(
            ST_SRID(point(${latitude}, ${longitude}), 4326),
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
