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
import { ProductsDashboardQuery } from './dto/filter/products-dashboard.query';
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
import { ProductClientQuery } from './dto/filter/products-client.query';
import { SingleProductClientQuery } from './dto/filter/single-product-client.query';
import { ProductCategoryPrice } from 'src/infrastructure/entities/product/product-category-price.entity';
import { DiscountType } from 'src/infrastructure/data/enums/discount-type.enum';

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

    @InjectRepository(ProductCategoryPrice)
    private readonly productCategoryPrice_repo: Repository<ProductCategoryPrice>,

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
    const productCategoryPrice = await this.productCategoryPrice_repo.findOne({
      where: { id: product_category_price_id },
    });
    if (!productCategoryPrice) {
      throw new NotFoundException('message_product_category_price_not_found');
    }

    const createProductOffer = this.productOffer_repo.create(
      createProductOfferRequest,
    );
    createProductOffer.product_category_price_id = product_category_price_id;
    if (createProductOffer.discount_type == DiscountType.VALUE) {
      createProductOffer.price =
        productCategoryPrice.price - createProductOffer.discount_value;
    } else {
      const discountedPercentage =
        (productCategoryPrice.price * createProductOffer.discount_value) / 100;
      createProductOffer.price =
        productCategoryPrice.price - discountedPercentage;
    }
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

  //* Get All Products For Client
  async getAllProductsForClient(productClientQuery: ProductClientQuery) {
    const {
      page,
      limit,
      longitude,
      latitude,
      section_id,
      category_sub_category_id,
      product_name,
      sort,
    } = productClientQuery;
    const skip = (page - 1) * limit;

    let productsSort = {};

    switch (sort) {
      case 'lowest_price':
        // Convert price to a numeric type before sorting
        productsSort = 'product_category_prices.price', 'ASC';
        break;
      case 'highest_price':
        productsSort = 'product_category_prices.price', 'DESC';
        break;
      case 'new':
        productsSort = 'product.created_at', 'DESC';
        break;
      // handle other sort cases if needed
    }
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

    // Start building the query
    let query = this.productRepository
      .createQueryBuilder('product')

      .innerJoinAndSelect('product.warehouses_products', 'warehousesProduct')
      .innerJoinAndSelect(
        'product.product_measurements',
        'product_measurements',
      )
      .innerJoinAndSelect(
        'product_measurements.measurement_unit',
        'measurement_unit',
      )
      .innerJoinAndSelect(
        'product_measurements.product_category_prices',
        'product_category_prices',
      )
      .leftJoinAndSelect(
        'product_category_prices.product_offer',
        'product_offer',
      )
      .leftJoin(
        'product_category_prices.product_sub_category',
        'product_sub_category',
      )
      .leftJoin(
        'product_sub_category.category_subCategory',
        'category_subCategory',
      )
      .leftJoin('category_subCategory.section_category', 'section_category')
      .orderBy(productsSort)
      .skip(skip)
      .take(limit);

    // Modify condition if warehouse is defined
    if (warehouse) {
      query = query.andWhere('warehousesProduct.warehouse_id = :warehouseId', {
        warehouseId: warehouse.id,
      });
    }

    // Add search term condition if provided
    if (product_name) {
      query = query.andWhere(
        'product.name_ar LIKE :product_name OR product.name_en LIKE :product_name',
        { product_name: `%${product_name}%` },
      );
    }

    // Conditional where clause based on sub category
    if (category_sub_category_id) {
      query = query.andWhere(
        'product_sub_category.category_sub_category_id = :category_sub_category_id',
        {
          category_sub_category_id,
        },
      );
      const categorySubcategory = await this.categorySubcategory_repo.findOne({
        where: { id: category_sub_category_id },
      });
      await this.subCategoryService.updateMostHitSubCategory({
        sub_category_id: categorySubcategory.subcategory_id,
      });
    }

    // Conditional where clause based on section
    if (section_id) {
      query = query.andWhere('section_category.section_id = :section_id', {
        section_id,
      });
    }

    const [products, total] = await query.getManyAndCount();
    return { products, total };
  }

  //* Get All Products Offers  For Client
  async getAllProductsOffersForClient(productClientQuery: ProductClientQuery) {
    const {
      page,
      limit,
      longitude,
      latitude,
      section_id,
      category_sub_category_id,
      product_name,sort
    } = productClientQuery;
    const skip = (page - 1) * limit;


    let productsSort = {};

    switch (sort) {
      case 'lowest_price':
        // Convert price to a numeric type before sorting
        productsSort = 'product_offer.price', 'ASC';
        break;
      case 'highest_price':
        productsSort = 'product_offer.price', 'DESC';
        break;
      case 'new':
        productsSort = 'product_offer.created_at', 'DESC';
        break;
      // handle other sort cases if needed
    }

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

    // Start building the query
    let query = this.productRepository
      .createQueryBuilder('product')

      .innerJoinAndSelect('product.warehouses_products', 'warehousesProduct')
      .innerJoinAndSelect(
        'product.product_measurements',
        'product_measurements',
      )
      .innerJoinAndSelect(
        'product_measurements.measurement_unit',
        'measurement_unit',
      )
      .innerJoinAndSelect(
        'product_measurements.product_category_prices',
        'product_category_prices',
      )
      .innerJoinAndSelect(
        'product_category_prices.product_offer',
        'product_offer',
      )
      .leftJoin(
        'product_category_prices.product_sub_category',
        'product_sub_category',
      )
      .leftJoin(
        'product_sub_category.category_subCategory',
        'category_subCategory',
      )
      .leftJoin('category_subCategory.section_category', 'section_category')
      .orderBy(productsSort)

      .skip(skip)
      .take(limit);

    // Modify condition if warehouse is defined
    if (warehouse) {
      query = query.andWhere('warehousesProduct.warehouse_id = :warehouseId', {
        warehouseId: warehouse.id,
      });
    }

    // Add search term condition if provided
    if (product_name) {
      query = query.andWhere(
        'product.name_ar LIKE :product_name OR product.name_en LIKE :product_name',
        { product_name: `%${product_name}%` },
      );
    }

    // Conditional where clause based on sub category
    if (category_sub_category_id) {
      query = query.andWhere(
        'product_sub_category.category_sub_category_id = :category_sub_category_id',
        {
          category_sub_category_id,
        },
      );
    }

    // Conditional where clause based on section
    if (section_id) {
      query = query.andWhere('section_category.section_id = :section_id', {
        section_id,
      });
    }

    const [products, total] = await query.getManyAndCount();
    return { products, total };
  }

  //* Get All Products For DashBoard
  async getAllProductsForDashboard(
    productsDashboardQuery: ProductsDashboardQuery,
  ) {
    const { limit, page } = productsDashboardQuery;
    const skip = (page - 1) * limit;

    const query = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.warehouses_products', 'warehousesProduct')
      .leftJoinAndSelect('product.product_measurements', 'product_measurements')
      .leftJoinAndSelect(
        'product_measurements.measurement_unit',
        'measurement_unit',
      )
      .leftJoinAndSelect(
        'product_measurements.product_category_prices',
        'product_category_prices',
      )
      .skip(skip)
      .take(limit);
    const [products, total] = await query.getManyAndCount();
    return { products, total };
  }

  //* Get All Products Offers For DashBoard
  async getAllProductsOffersForDashboard(
    productsDashboardQuery: ProductsDashboardQuery,
  ) {
    const { limit, page } = productsDashboardQuery;
    const skip = (page - 1) * limit;

    const query = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.warehouses_products', 'warehousesProduct')
      .innerJoinAndSelect(
        'product.product_measurements',
        'product_measurements',
      )
      .innerJoinAndSelect(
        'product_measurements.measurement_unit',
        'measurement_unit',
      )
      .innerJoinAndSelect(
        'product_measurements.product_category_prices',
        'product_category_prices',
      )
      .innerJoinAndSelect(
        'product_category_prices.product_offer',
        'product_offer',
      )
      .skip(skip)
      .take(limit);
    const [products, total] = await query.getManyAndCount();
    return { products, total };
  }

  //* Get Single Product For Client
  async getSingleProductForClient(
    product_id: string,
    singleProductClientFilter: SingleProductClientQuery,
  ) {
    const { latitude, longitude, section_id, category_sub_category_id } =
      singleProductClientFilter;
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
    // Start building the query
    let query = this.productRepository
      .createQueryBuilder('product')

      .innerJoinAndSelect('product.warehouses_products', 'warehousesProduct')
      .innerJoinAndSelect(
        'product.product_measurements',
        'product_measurements',
      )
      .innerJoinAndSelect(
        'product_measurements.measurement_unit',
        'measurement_unit',
      )
      .innerJoinAndSelect(
        'product_measurements.product_category_prices',
        'product_category_prices',
      )
      .leftJoinAndSelect(
        'product_category_prices.product_offer',
        'product_offer',
      )
      .leftJoinAndSelect(
        'product_category_prices.product_additional_services',
        'product_additional_services',
      )
      .leftJoinAndSelect(
        'product_additional_services.additional_service',
        'additional_service',
      )
      .leftJoin(
        'product_category_prices.product_sub_category',
        'product_sub_category',
      )
      .leftJoin(
        'product_sub_category.category_subCategory',
        'category_subCategory',
      )
      .leftJoin('category_subCategory.section_category', 'section_category');

    // Get single product
    query = query.where('product.id = :product_id', { product_id });
    // Initial condition to ensure product is in at least one warehouse
    if (warehouse) {
      query = query.andWhere('warehousesProduct.warehouse_id = :warehouseId', {
        warehouseId: warehouse.id,
      });
    }
    // Conditional where clause based on sub category
    if (category_sub_category_id) {
      query = query.andWhere(
        'product_sub_category.category_sub_category_id = :category_sub_category_id',
        {
          category_sub_category_id,
        },
      );
    }

    // Conditional where clause based on section
    if (section_id) {
      query = query.andWhere('section_category.section_id = :section_id', {
        section_id,
      });
    }
    return await query.getOne();
  }

  //* Get Single Product For Dashboard
  async getSingleProductForDashboard(product_id: string) {
    // For guests and individuals, orders are taken from the nearest warehouse
    // Start building the query
    let query = this.productRepository
      .createQueryBuilder('product')

      .leftJoinAndSelect('product.warehouses_products', 'warehousesProduct')

      .leftJoinAndSelect('product.product_measurements', 'product_measurements')

      .leftJoinAndSelect(
        'product_measurements.measurement_unit',
        'measurement_unit',
      )
      .leftJoinAndSelect(
        'product_measurements.product_category_prices',
        'product_category_prices',
      )
      .leftJoinAndSelect(
        'product_category_prices.product_offer',
        'product_offer',
      )
      .leftJoinAndSelect(
        'product_category_prices.product_additional_services',
        'product_additional_services',
      )
      .leftJoinAndSelect(
        'product_additional_services.additional_service',
        'additional_service',
      )
      .leftJoin(
        'product_category_prices.product_sub_category',
        'product_sub_category',
      )
      .leftJoin(
        'product_sub_category.category_subCategory',
        'category_subCategory',
      )
      .leftJoin('category_subCategory.section_category', 'section_category');

    // Get single product
    query = query.where('product.id = :product_id', { product_id });

    return await query.getOne();
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
