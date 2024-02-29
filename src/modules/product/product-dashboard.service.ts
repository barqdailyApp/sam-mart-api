import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
import { FileService } from '../file/file.service';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import {
  CreateProductExcelRequest,
  CreateProductsExcelRequest,
} from './dto/request/create-products-excel.request';
import { toUrl } from 'src/core/helpers/file.helper';
import { SingleProductDashboardQuery } from './dto/filter/single-product-dashboard.query';
import { UpdateProductOfferRequest } from './dto/request/update-product-offer.request';

@Injectable()
export class ProductDashboardService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
    @InjectRepository(ProductMeasurement)
    private readonly productMeasurementRepository: Repository<ProductMeasurement>,
    @InjectRepository(Subcategory)
    private subcategory_repo: Repository<Subcategory>,
    @InjectRepository(ProductOffer)
    private readonly productOfferRepository: Repository<ProductOffer>,
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

    @Inject(FileService) private _fileService: FileService,
  ) {}
  isArabic(text: string): boolean {
    return /[\u0600-\u06FF]/.test(text);
  }
  async createProduct(
    createProductRequest: CreateProductRequest,
  ): Promise<Product> {
    return await this.addProductTransaction.run(createProductRequest);
  }

  async createProductOffer(
    product_category_price_id: string,
    createProductOfferRequest: CreateProductOfferRequest,
  ) {
    const { max_offer_quantity, min_offer_quantity, end_date, start_date } =
      createProductOfferRequest;
    if (max_offer_quantity < min_offer_quantity) {
      throw new BadRequestException(
        'max_offer_quantity_must_be_greater_than_min_offer_quantity',
      );
    }
    if (end_date < start_date) {
      throw new BadRequestException('end_date_must_be_greater_than_start_date');
    }
    const productCategoryPrice = await this.productCategoryPrice_repo.findOne({
      where: { id: product_category_price_id },
    });
    if (!productCategoryPrice) {
      throw new NotFoundException('message_product_category_price_not_found');
    }
    const productOffer = await this.productOffer_repo.findOne({
      where: { product_category_price_id: product_category_price_id },
    });
    if (productOffer) {
      throw new BadRequestException('message_product_offer_already_exist');
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
  async updateProductOffer(
    offer_id: string,
    updateProductOfferRequest: UpdateProductOfferRequest,
  ) {
    const {
      discount_type,
      discount_value,
      end_date,
      is_active,
      max_offer_quantity,
      min_offer_quantity,
      start_date,offer_quantity
    } = updateProductOfferRequest;
    const productOffer = await this.productOffer_repo.findOne({
      where: { id: offer_id },
      relations: { product_category_price: true },
    });
    let productOfferPrice = productOffer.price;

    if (!productOffer) {
      throw new NotFoundException('message_product_offer_not_found');
    }
    if (discount_type != undefined && discount_value != undefined) {
      if (discount_type == DiscountType.VALUE) {
        productOfferPrice =
          productOffer.product_category_price.price - discount_value;
      } else {
        const discountedPercentage =
          (productOffer.product_category_price.price * discount_value) / 100;
        productOfferPrice =
          productOffer.product_category_price.price - discountedPercentage;
      }
    }

    await this.productOffer_repo.update(
      { id: offer_id },
      {
        discount_type,
        discount_value,
        end_date,
        start_date,
        is_active,
        max_offer_quantity,
        min_offer_quantity,
        price: productOfferPrice,
        offer_quantity
      },
    );
    return await this.productOffer_repo.findOne({
      where: { id: offer_id },
      relations: { product_category_price: true },
    });
  }
  async deleteProductOffer(product_id: string) {
    const productOffer = await this.productOffer_repo.findOne({
      where: { id: product_id },
    });
    if (!productOffer) {
      throw new NotFoundException('message_product_offer_not_found');
    }
    return await this.productOffer_repo.softDelete({ id: product_id });
  }

  async addProductImage(
    product_id: string,
    createSingleImageRequest: CreateSingleImageRequest,
  ) {
    const { file, is_logo } = createSingleImageRequest;
    const product = await this.productRepository.findOne({
      where: { id: product_id },
      relations: { product_images: true },
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

    const productImageSaved = await this.productImageRepository.save(
      productImage,
    );
    if (productImageSaved.is_logo) {
      for (let index = 0; index < product.product_images.length; index++) {
        if (product.product_images[index].is_logo == true) {
          await this.productImageRepository.update(
            product.product_images[index].id,
            {
              is_logo: false,
            },
          );
        }
      }
    }

    return productImageSaved;
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
    if (!is_main_unit) {
      const mainProductMeasurement =
        await this.productMeasurementRepository.findOne({
          where: { product_id, is_main_unit: true },
        });
      productMeasurement.base_unit_id = mainProductMeasurement.id;
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

    // Check if the product exists
    const product = await this.productRepository.findOne({
      where: { id: product_id },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check if the product measurement exists
    const productMeasurement = await this.productMeasurementRepository.findOne({
      where: { id: product_measurement_unit_id },
    });
    if (!productMeasurement) {
      throw new NotFoundException('Product measurement not found');
    }

    // Prepare the update data
    const updateData: any = { conversion_factor, is_main_unit };

    // If the unit is marked as the main unit, ensure the conversion factor is 1

    if (
      conversion_factor !== undefined &&
      conversion_factor !== null &&
      conversion_factor !== 1 &&
      is_main_unit == true
    ) {
      throw new BadRequestException(
        'The conversion factor must be 1 for the main unit',
      );
    }

    // Update base unit logic
    // Check if `is_main_unit` is defined and not null
    if (is_main_unit !== undefined && is_main_unit !== null) {
      // If `is_main_unit` is true, set the `base_unit_id` to null
      // This indicates that this unit is the main unit and doesn't link to any other unit
      if (is_main_unit) {
        updateData.base_unit_id = null;
      } else {
        // If the unit is not the main unit, find the main unit for the product
        const mainProductMeasurement =
          await this.productMeasurementRepository.findOne({
            where: { product_id, is_main_unit: true },
          });

        // If a main unit doesn't exist, throw an error
        if (!mainProductMeasurement) {
          throw new NotFoundException('Main product measurement not found');
        }

        // Link this unit to the found main unit by setting `base_unit_id` to the main unit's ID
        updateData.base_unit_id = mainProductMeasurement.id;
      }
    }

    // Perform the update and return the updated product measurement
    await this.productMeasurementRepository.update(
      { id: product_measurement_unit_id },
      updateData,
    );
    return await this.productMeasurementRepository.findOne({
      where: { id: product_measurement_unit_id },
    });
  }

  async updateProductImage(product_id: string, image_id: string) {
    //* Check if product exist
    const product = await this.productRepository.findOne({
      where: { id: product_id },
      relations: {
        product_images: true,
      },
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

    for (let index = 0; index < product.product_images.length; index++) {
      if (product.product_images[index].is_logo == true) {
        await this.productImageRepository.update(
          product.product_images[index].id,
          {
            is_logo: false,
          },
        );
      }
    }
    await this.productImageRepository.update(image_id, {
      is_logo: true,
    });

    //* Return updated image
    return await this.productImageRepository.findOne({
      where: { id: image_id },
    });
  }

  //* Get All Products For DashBoard
  async getAllProductsForDashboard(
    productsDashboardQuery: ProductsDashboardQuery,
  ) {
    const {
      limit,
      page,
      category_sub_category_id,
      product_name,
      section_id,
      section_category_id,
      sort,
    } = productsDashboardQuery;
    const skip = (page - 1) * limit;
    let productsSort = {};

    switch (sort) {
      case 'new':
        productsSort = { 'product.created_at': 'DESC' };
        break;
    }
    console.log(productsSort);
    let query = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.product_images', 'product_images')

      .leftJoinAndSelect(
        'product.product_sub_categories',
        'product_sub_categories',
      )
      .leftJoinAndSelect(
        'product_sub_categories.category_subCategory',
        'category_subCategory',
      )
      .leftJoinAndSelect(
        'category_subCategory.section_category',
        'section_category',
      )
      .leftJoinAndSelect('section_category.section', 'section')

      .leftJoinAndSelect('product.warehouses_products', 'warehousesProduct')
      .leftJoinAndSelect(
        'product.product_measurements',
        'product_measurements',
        'product_measurements.is_main_unit = true',
      )
      .leftJoinAndSelect(
        'product_measurements.measurement_unit',
        'measurement_unit',
      )
      .orderBy(productsSort)
      .skip(skip)
      .take(limit);
    // Add search term condition if provided
    if (product_name) {
      // Determine if the product_name is Arabic
      const isProductNameArabic = this.isArabic(product_name); // Implement or use a library to check if the text is Arabic

      // Build the query conditionally based on the language of product_name
      if (isProductNameArabic) {
        query = query.andWhere('product.name_ar LIKE :product_name', {
          product_name: `%${product_name}%`,
        });
      } else {
        query = query.andWhere('product.name_en LIKE :product_name', {
          product_name: `%${product_name}%`,
        });
      }
    }

    // Conditional where clause based on sub category
    if (category_sub_category_id) {
      console.log('category_sub_category_id = ', category_sub_category_id);
      query = query.andWhere(
        'product_sub_categories.category_sub_category_id = :category_sub_category_id',
        {
          category_sub_category_id,
        },
      );
    }

    if (section_category_id) {
      query = query.andWhere(
        'category_subCategory.section_category_id = :section_category_id',
        {
          section_category_id,
        },
      );
    }
    if (section_id) {
      query = query.andWhere('section_category.section_id = :section_id', {
        section_id,
      });
    }
    const [products, total] = await query.getManyAndCount();
    return { products, total };
  }


  async getAllProductsOffersForDashboard2(
    productsDashboardQuery: ProductsDashboardQuery,
  ) {
    const {
      page,
      limit,
      section_category_id,
      section_id,
      category_sub_category_id,
      product_name,
      sort,
    } = productsDashboardQuery;
    const skip = (page - 1) * limit;

    let productsSort = {};

    switch (sort) {
      case 'new':
        productsSort = { 'product.created_at': 'DESC' };

        break;
    }

    // Start building the query
    let query = this.productOfferRepository
      .createQueryBuilder('product_offer')
      .leftJoinAndSelect(
        'product_offer.product_category_price',
        'product_category_prices',
      )

      .leftJoinAndSelect(
        'product_category_prices.product_additional_services',
        'product_additional_services',
      )
      .leftJoinAndSelect(
        'product_additional_services.additional_service',
        'additional_service',
      )

      .leftJoinAndSelect(
        'product_category_prices.product_measurement',
        'product_measurement',
      )
      .leftJoinAndSelect(
        'product_measurement.measurement_unit',
        'measurement_unit',
      )

      .leftJoinAndSelect(
        'product_category_prices.product_sub_category',
        'product_sub_category',
      )

      .leftJoinAndSelect(
        'product_sub_category.category_subCategory',
        'category_subCategory',
      )
      .leftJoinAndSelect(
        'category_subCategory.section_category',
        'section_category',
      )
      .leftJoinAndSelect('section_category.section', 'section')
      .leftJoinAndSelect('product_sub_category.product', 'product')
      .leftJoinAndSelect('product.warehouses_products', 'warehousesProduct')
      .leftJoinAndSelect(
        'product.product_measurements',
        'product_measurements',
      )

      .leftJoinAndSelect('product.product_images', 'product_images')

      .where(
        'product_offer.offer_quantity > 0 AND product_offer.start_date <= :current_date AND product_offer.end_date >= :current_date',
        {
          current_date: new Date(),
        },
      )
      .orderBy(productsSort)

      .skip(skip)
      .take(limit);

    // Add search term condition if provided
    if (product_name) {
      // Determine if the product_name is Arabic
      const isProductNameArabic = this.isArabic(product_name); // Implement or use a library to check if the text is Arabic

      // Build the query conditionally based on the language of product_name
      if (isProductNameArabic) {
        query = query.andWhere('product.name_ar LIKE :product_name', {
          product_name: `%${product_name}%`,
        });
      } else {
        query = query.andWhere('product.name_en LIKE :product_name', {
          product_name: `%${product_name}%`,
        });
      }
    }

    // Conditional where clause based on sub category
    if (category_sub_category_id) {
      query = query.andWhere(
        'product_sub_category.category_sub_category_id = :category_sub_category_id',
        {
          category_sub_category_id,
        },
      );

      query = query.andWhere('product.is_active = true');
      query = query.andWhere('product_sub_category.is_active = true');
    }

    // Conditional where clause based on section
    if (section_id) {
      query = query.andWhere('section_category.section_id = :section_id', {
        section_id,
      });
      query = query.andWhere('product.is_active = true');
      query = query.andWhere('product_sub_category.is_active = true');
    }
    const [products, total] = await query.getManyAndCount();
    return { products, total };
  }
  async getSingleProductOfferDashboard(offer_id: string) {
    // Start building the query
    let query = this.productOfferRepository
      .createQueryBuilder('product_offer')
      .innerJoinAndSelect(
        'product_offer.product_category_price',
        'product_category_prices',
      )

      .innerJoinAndSelect(
        'product_category_prices.product_additional_services',
        'product_additional_services',
      )
      .innerJoinAndSelect(
        'product_additional_services.additional_service',
        'additional_service',
      )

      .innerJoinAndSelect(
        'product_category_prices.product_measurement',
        'product_measurement',
      )
      .innerJoinAndSelect(
        'product_measurement.measurement_unit',
        'measurement_unit',
      )

      .innerJoinAndSelect(
        'product_category_prices.product_sub_category',
        'product_sub_category',
      )

      .innerJoinAndSelect(
        'product_sub_category.category_subCategory',
        'category_subCategory',
      )
      .innerJoinAndSelect(
        'category_subCategory.section_category',
        'section_category',
      )
      .innerJoinAndSelect('section_category.section', 'section')
      .innerJoinAndSelect('product_sub_category.product', 'product')
      .innerJoinAndSelect('product.warehouses_products', 'warehousesProduct')
      .innerJoinAndSelect(
        'product.product_measurements',
        'product_measurements',
      )

      .innerJoinAndSelect('product.product_images', 'product_images')

      .where(
        'product_offer.offer_quantity > 0 AND product_offer.start_date <= :current_date AND product_offer.end_date >= :current_date',
        {
          current_date: new Date(),
        },
      )
      .andWhere('product_offer.id = :offer_id', { offer_id });
    return await query.getOne();
  }

  //* Get Single Product For Dashboard
  async getSingleProductForDashboard(
    singleProductDashboardQuery: SingleProductDashboardQuery,
  ) {
    const { category_sub_category_id, product_id } =
      singleProductDashboardQuery;
    // For guests and individuals, orders are taken from the nearest warehouse
    // Start building the query
    let query = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.product_images', 'product_images')
      .leftJoinAndSelect(
        'product.product_sub_categories',
        'product_sub_categories',
      )
      .leftJoinAndSelect(
        'product_sub_categories.category_subCategory',
        'product_category_subCategory',
      )
      .leftJoinAndSelect(
        'product_category_subCategory.section_category',
        'product_section_category',
      )
      .leftJoinAndSelect('product_section_category.section', 'product_section')
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
    if (category_sub_category_id) {
      console.log('category_sub_category_id = ', category_sub_category_id);
      query = query.andWhere(
        'product_sub_categories.category_sub_category_id = :category_sub_category_id',
        {
          category_sub_category_id,
        },
      );

      query = query.andWhere(
        'product_sub_category.category_sub_category_id = :category_sub_category_id',
        {
          category_sub_category_id,
        },
      );
    }
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
      relations: { product_images: true },
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
    // const measurement = await this.SingleProductMeasurement(
    //   product_id,
    //   product_measurement_id,
    // );
    // if (measurement.is_main_unit == true) {
    //   throw new NotFoundException(
    //     'There must be at least one main measurement',
    //   );
    // }
    return await this.productMeasurementRepository.delete({
      id: product_measurement_id,
    });
  }

  async exportProducts() {
    const products = await this.productRepository.find({
      relations: {
        product_images: true,
        warehouses_products: true,
        product_measurements: true,
        product_sub_categories: {
          category_subCategory: {
            section_category: {
              category: true,
              section: true,
            },
            subcategory: true,
          },
        },
      },
    });

    // Create a flat structure for products
    const flattenedProducts = products.map((product) => {
      return {
        productId: product.id,
        createdAt: product.created_at,
        updatedAt: product.updated_at,
        name_ar: product.name_ar,
        name_en: product.name_en,
        description_ar: product.description_ar,
        description_en: product.description_en,
        is_active: product.is_active,
        is_recovered: product.is_recovered,
        product_images: product.product_images.map((image) => ({
          url: toUrl(image.url),
          is_logo: image.is_logo,
        })),
        warehousesProducts: product.warehouses_products,
        productMeasurements: product.product_measurements.map(
          (measurement) => ({
            measuremen_id: measurement.id,
            conversion_factor: measurement.conversion_factor,
            product_id: measurement.product_id,
            measurement_unit_id: measurement.measurement_unit_id,
            base_unit_id: measurement.base_unit_id,
            is_main_unit: measurement.is_main_unit,
          }),
        ),
        productSubCategories: product.product_sub_categories.map(
          (subCategory) => ({
            subCategory_id: subCategory.category_subCategory.subcategory.id,
            subCategory_name_ar:
              subCategory.category_subCategory.subcategory.name_ar,
            subCategory_name_en:
              subCategory.category_subCategory.subcategory.name_en,
            category_id:
              subCategory.category_subCategory.section_category.category.id,
            category_name_ar:
              subCategory.category_subCategory.section_category.category
                .name_ar,
            category_name_en:
              subCategory.category_subCategory.section_category.category
                .name_en,
            section_id:
              subCategory.category_subCategory.section_category.section.id,
            section_name_ar:
              subCategory.category_subCategory.section_category.section.name_ar,
            section_name_en:
              subCategory.category_subCategory.section_category.section.name_en,
          }),
        ),
      };
    });

    return await this._fileService.exportExcel(
      flattenedProducts,
      'products',
      'products',
    );
  }

  async importProducts(req: any) {
    const file = await this.storageManager.store(req.file, {
      path: 'product-export',
    });
    const jsonData = await this._fileService.importExcel(file);

    const CreateProductRequest = plainToClass(CreateProductsExcelRequest, {
      products: jsonData,
    });
    const validationErrors = await validate(CreateProductRequest);
    if (validationErrors.length > 0) {
      throw new BadRequestException(JSON.stringify(validationErrors));
    }

    const newProducts = jsonData.map((productData) => {
      const {
        name_ar,
        name_en,
        description_ar,
        description_en,
        is_active,
        is_recovered,
        product_images,
      } = plainToClass(CreateProductExcelRequest, productData);

      return this.productRepository.create({
        name_ar,
        name_en,
        description_ar,
        description_en,
        is_active,
        is_recovered,
        product_images,
      });
    });

    return await this.productRepository.save(newProducts);
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
