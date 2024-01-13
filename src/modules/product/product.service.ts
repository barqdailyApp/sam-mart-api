import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/infrastructure/entities/product/product.entity';
import { DeleteResult, IsNull, Not, Repository } from 'typeorm';
import { CreateProductRequest } from './dto/request/create-product.request';
import { CreateProductTransaction } from './utils/create-product.transaction';
import { UpdateProductRequest } from './dto/request/update-product.request';
import { ProductImage } from 'src/infrastructure/entities/product/product-image.entity';
import { ProductMeasurement } from 'src/infrastructure/entities/product/product-measurement.entity';
import { UpdateProductMeasurementRequest } from './dto/request/update-product-measurement.request';
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
import { StorageManager } from 'src/integration/storage/storage.manager';
import * as sharp from 'sharp';
import { ImageManager } from 'src/integration/sharp/image.manager';
import { CreateProductImageRequest } from './dto/request/product-images/create-product-image.request';
import { CreateSingleImageRequest } from './dto/request/product-images/create-single-image.request';
import { UpdateSingleImageRequest } from './dto/request/product-images/update-single-image.request';
import { CreateProductMeasurementRequest } from './dto/request/create-product-measurement.request';

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

    @Inject(SubcategoryService)
    private readonly subCategoryService: SubcategoryService,

    @Inject(StorageManager) private readonly storageManager: StorageManager,

    @Inject(ImageManager) private readonly imageManager: ImageManager,
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

  async addProductImage(
    product_id: string,
    createSingleImageRequest: CreateSingleImageRequest,
  ) {
    const { file, is_logo } = createSingleImageRequest;
    const product = await this.productRepository.findOne({
      where: { id: product_id },
    });
    if (!product) {
      throw new NotFoundException('message_product_not_found');
    }

    const resizedImage = await this.imageManager.resize(file, {
      size: {},
      options: {
        fit: sharp.fit.cover,
        position: sharp.strategy.entropy,
      },
    });

    // save image
    const path = await this.storageManager.store(
      { buffer: resizedImage, originalname: file.originalname },
      { path: 'banners' },
    );

    const productImage = this.productImageRepository.create({
      product_id,
      is_logo,
      url: path,
    });
    return await this.productImageRepository.save(productImage);
  }

  async addProductMeasurement(
    product_id: string,
    createProductMeasurementRequest: CreateProductMeasurementRequest,
  ) {
    const { conversion_factor, is_main_unit, measurement_unit_id } =
      createProductMeasurementRequest;
    const product = await this.productRepository.findOne({
      where: { id: product_id },
    });
    if (!product) {
      throw new NotFoundException('message_product_not_found');
    }
    const productMeasurement = this.productMeasurementRepository.create({
      conversion_factor,
      is_main_unit,
      measurement_unit_id,
      product_id,
    });
    //* Set Main Unit
    if (is_main_unit) {
      productMeasurement.base_unit_id = measurement_unit_id;
    }
    return await this.productMeasurementRepository.save(productMeasurement);
  }
  async updateProduct(
    product_id: string,
    updateProductRequest: UpdateProductRequest,
  ): Promise<Product> {
    const {
      description_ar,
      description_en,
      is_active,
      is_recovered,
      name_ar,
      name_en,
    } = updateProductRequest;

    //* Check if product exist
    const product = await this.productRepository.findOne({
      where: { id: product_id },
    });
    if (!product) {
      throw new NotFoundException('message_product_not_found');
    }
    await this.productRepository.update(
      { id: product_id },
      {
        is_active,
        is_recovered,
        name_en,
        name_ar,
        description_ar,
        description_en,
      },
    );
    return await this.productRepository.findOne({
      where: { id: product_id },
    });
  }
  async updateProductMeasurement(
    product_id: string,
    product_measurement_unit_id: string,
    updateProductMeasurementRequest: UpdateProductMeasurementRequest,
  ) {
    const { conversion_factor, is_main_unit } = updateProductMeasurementRequest;
    const product = await this.productRepository.findOne({
      where: { id: product_id },
    });
    if (!product) {
      throw new NotFoundException('message_product_not_found');
    }
    const productMeasurement = await this.productMeasurementRepository.findOne({
      where: { id: product_measurement_unit_id },
    });
    if (!productMeasurement) {
      throw new NotFoundException('message_product_measurement_not_found');
    }
    const updateData: any = { conversion_factor, is_main_unit };

    //* Update base unit
    if (is_main_unit != undefined || is_main_unit != null) {
      if (is_main_unit) {
        updateData.base_unit_id = product_measurement_unit_id;
      } else {
        updateData.base_unit_id = null;
      }
    }
    await this.productMeasurementRepository.update(
      { id: product_measurement_unit_id },
      updateData,
    );
    return await this.productMeasurementRepository.findOne({
      where: { id: product_measurement_unit_id },
    });
  }

  async updateProductImage(
    product_id: string,
    image_id: string,
    updateSingleImageRequest: UpdateSingleImageRequest,
  ) {
    const { file, is_logo } = updateSingleImageRequest;

    //* Check if product exist
    const product = await this.productRepository.findOne({
      where: { id: product_id },
    });
    if (!product) {
      throw new NotFoundException('message_product_not_found');
    }

    //* Check if image exist
    const productImage = await this.productImageRepository.findOne({
      where: { id: image_id },
    });
    if (!productImage) {
      throw new NotFoundException('message_product_image_not_found');
    }
    //* Update image
    if (file) {
      const resizedImage = await this.imageManager.resize(file, {
        size: {},
        options: {
          fit: sharp.fit.cover,
          position: sharp.strategy.entropy,
        },
      });

      // save image
      const path = await this.storageManager.store(
        { buffer: resizedImage, originalname: file.originalname },
        { path: 'banners' },
      );
      await this.productImageRepository.update(image_id, {
        url: path,
        is_logo: is_logo,
      });
    } else {
      await this.productImageRepository.update(image_id, {
        is_logo: is_logo,
      });
    }
    //* Return updated image
    return await this.productImageRepository.findOne({
      where: { id: image_id },
    });
  }

  async AllProduct(productFilter: ProductFilter) {
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

    // For guests and individuals, orders are taken from the nearest warehouse
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

      .leftJoin('product.product_sub_categories', 'product_sub_categories')

      .leftJoin(
        'product_sub_categories.category_subCategory',
        'category_subCategory',
      )
      .leftJoin('category_subCategory.section_category', 'section_category')

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

    //* filter products by section
    if (section_id) {
      // if product have prices
      if (withPrices) {
        query.andWhere('section_category.section_id = :section_id', {
          section_id,
        });
        query.andWhere('section_category_price.section_id = :section_id', {
          section_id,
        });
      } else {
        query.andWhere('section_category.section_id = :section_id', {
          section_id,
        });
      }
    }
    //* filter products by section category
    if (section_category_id) {
      // if product have prices
      if (withPrices) {
        const categorySubcategory = await this.categorySubcategory_repo.findOne(
          {
            relations: { section_category: true },
            where: { section_category: { id: section_category_id } },
          },
        );
        query.andWhere(
          'category_subCategory.section_category_id = :section_category_id',
          {
            section_category_id,
          },
        );
        query.andWhere(
          'product_sub_category.category_sub_category_id = :category_sub_category_id',
          {
            category_sub_category_id: categorySubcategory.id,
          },
        );
      } else {
        query.andWhere(
          'category_subCategory.section_category_id = :section_category_id',
          {
            section_category_id,
          },
        );
      }
    }

    //* filter products by sub category
    if (category_sub_category_id) {
      // if product have prices
      if (withPrices) {
        query.andWhere('category_subCategory.id = :category_sub_category_id', {
          category_sub_category_id,
        });
        query.andWhere(
          'product_sub_category.category_sub_category_id = :category_sub_category_id',
          {
            category_sub_category_id,
          },
        );
      } else {
        query.andWhere('category_subCategory.id = :category_sub_category_id', {
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

    //* filter products by name
    if (product_name) {
      query.orWhere('product.name_ar like :product_name', {
        product_name: `%${product_name}%`,
      });
      query.orWhere('product.name_en like :product_name', {
        product_name: `%${product_name}%`,
      });
    }

    //* filter products have offers
    if (withOffers) {
      query.andWhere('product_offer.product_category_price_id IS NOT NULL');
    }

    //* filter products by warehouse
    if (withWarehouse) {
      query.andWhere('warehouses_products.product_id IS NOT NULL');
    }

    //* filter products by warehouse
    if (warehouse) {
      console.log('filter products by warehouse');
      query.andWhere('warehouses_products.warehouse_id = :warehouse', {
        warehouse: warehouse.id,
      });
    }
    const [products, total] = await query.getManyAndCount();
    return { products, total };
  }



  //* Get All Products For Client
  // async getAllProductsForClient(){
  // }
















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
    product_measurement_id: string,
  ): Promise<DeleteResult> {
    const product = await this.productRepository.findOne({
      where: { id: product_id },
    });
    if (!product) {
      throw new NotFoundException('message_product_not_found');
    }
    const measurement = await this.SingleProductMeasurement(
      product_id,
      product_measurement_id,
    );
    if (measurement.base_unit_id != null) {
      throw new NotFoundException(
        'There must be at least one main measurement',
      );
    }
    return await this.productMeasurementRepository.delete({
      id: product_measurement_id,
    });
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
    product_measurement_id: string,
  ): Promise<ProductMeasurement> {
    const product = await this.productRepository.findOne({
      where: { id: product_id },
    });
    if (!product) {
      throw new NotFoundException('message_product_not_found');
    }
    const productMeasurement = await this.productMeasurementRepository.findOne({
      where: { id: product_measurement_id },
    });
    if (!productMeasurement) {
      throw new NotFoundException('Product Measurement not found');
    }
    return productMeasurement;
  }
}
