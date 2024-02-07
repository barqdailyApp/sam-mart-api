import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategorySubCategory } from 'src/infrastructure/entities/category/category-subcategory.entity';

import { Product } from 'src/infrastructure/entities/product/product.entity';
import { Warehouse } from 'src/infrastructure/entities/warehouse/warehouse.entity';

import { ProductClientQuery } from './dto/filter/products-client.query';
import { SingleProductClientQuery } from './dto/filter/single-product-client.query';
import { Repository } from 'typeorm';
import { SubcategoryService } from '../subcategory/subcategory.service';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { ProductFavorite } from 'src/infrastructure/entities/product/product-favorite.entity';
import { Section } from 'src/infrastructure/entities/section/section.entity';
import { ProductFavQuery } from './dto/filter/product-fav.query';
import { Cart } from 'src/infrastructure/entities/cart/cart.entity';
@Injectable()
export class ProductClientService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(CategorySubCategory)
    private readonly categorySubcategory_repo: Repository<CategorySubCategory>,

    @InjectRepository(Warehouse)
    private readonly warehouse_repo: Repository<Warehouse>,

    @Inject(SubcategoryService)
    private readonly subCategoryService: SubcategoryService,

    @InjectRepository(ProductFavorite)
    private readonly productFavorite_repo: Repository<ProductFavorite>,

    @InjectRepository(Section)
    private readonly section_repo: Repository<Section>,

    @InjectRepository(Cart)
    private readonly cart_repo: Repository<Cart>,

    @Inject(REQUEST) private readonly request: Request,
  ) {}

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
      user_id,
    } = productClientQuery;
    const skip = (page - 1) * limit;

    let productsSort = {};

    switch (sort) {
      case 'lowest_price':
        // Convert price to a numeric type before sorting
        (productsSort = 'product_category_prices.price'), 'ASC';
        break;
      case 'highest_price':
        (productsSort = 'product_category_prices.price'), 'DESC';
        break;
      case 'new':
        (productsSort = 'product.created_at'), 'DESC';
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
      // .leftJoinAndSelect('product.products_favorite', 'products_favorite')

      .innerJoinAndSelect('product.product_images', 'product_images')
      .innerJoinAndSelect(
        'product.product_sub_categories',
        'product_sub_categories',
      )
      .innerJoinAndSelect(
        'product_sub_categories.category_subCategory',
        'product_category_subCategory',
      )
      .innerJoinAndSelect(
        'product_category_subCategory.section_category',
        'product_section_category',
      )
      .innerJoinAndSelect('product_section_category.section', 'product_section')
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
      .innerJoin(
        'product_category_prices.product_sub_category',
        'product_sub_category',
      )
      .innerJoin(
        'product_sub_category.category_subCategory',
        'category_subCategory',
      )
      .innerJoin('category_subCategory.section_category', 'section_category')
      .orderBy('productSubCategory.order_by', 'ASC')
      .orderBy(productsSort)

      .skip(skip)
      .take(limit);

    if (user_id) {
      const cartUser = await this.cart_repo.findOne({ where: { user_id } });
      if (!cartUser) {
        throw new NotFoundException('user not found');
      }

      query = query.leftJoinAndSelect(
        'product_category_prices.cart_products',
        'cart_products',
        'cart_products.cart_id = :cart_id',
        { cart_id: cartUser.id },
      );

      query = query.leftJoinAndSelect(
        'product.products_favorite',
        'products_favorite',
        'products_favorite.user_id = :user_id',
        { user_id },
      );
    }
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
      query = query.andWhere('product.is_active = true');
      query = query.andWhere('product_sub_categories.is_active = true');
      query = query.andWhere(
        'product_sub_categories.category_sub_category_id = :category_sub_category_id',
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
      query = query.andWhere('product.is_active = true');
      query = query.andWhere('product_sub_categories.is_active = true');
      query = query.andWhere(
        'product_section_category.section_id = :section_id',
        {
          section_id,
        },
      );
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
      product_name,
      sort,
      user_id,
    } = productClientQuery;
    const skip = (page - 1) * limit;

    let productsSort = {};

    switch (sort) {
      case 'lowest_price':
        // Convert price to a numeric type before sorting
        (productsSort = 'product_offer.price'), 'ASC';
        break;
      case 'highest_price':
        (productsSort = 'product_offer.price'), 'DESC';
        break;
      case 'new':
        (productsSort = 'product_offer.created_at'), 'DESC';
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
      .innerJoinAndSelect('product.product_images', 'product_images')
      .innerJoinAndSelect(
        'product.product_sub_categories',
        'product_sub_categories',
      )
      .innerJoinAndSelect(
        'product_sub_categories.category_subCategory',
        'product_category_subCategory',
      )
      .innerJoinAndSelect(
        'product_category_subCategory.section_category',
        'product_section_category',
      )
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
      .innerJoinAndSelect('product_section_category.section', 'product_section')

      .innerJoinAndSelect(
        'product_category_prices.product_offer',
        'product_offer',
      )
      .innerJoin(
        'product_category_prices.product_sub_category',
        'product_sub_category',
      )
      .innerJoin(
        'product_sub_category.category_subCategory',
        'category_subCategory',
      )
      .innerJoin('category_subCategory.section_category', 'section_category')
      .orderBy(productsSort)

      .skip(skip)
      .take(limit);

    if (user_id) {
      const cartUser = await this.cart_repo.findOne({ where: { user_id } });
      if (!cartUser) {
        throw new NotFoundException('user not found');
      }

      query = query.leftJoinAndSelect(
        'product_category_prices.cart_products',
        'cart_products',
        'cart_products.cart_id = :cart_id',
        { cart_id: cartUser.id },
      );
      query = query.leftJoinAndSelect(
        'product.products_favorite',
        'products_favorite',
        'products_favorite.user_id = :user_id',
        { user_id },
      );
    }
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
      query = query.andWhere('product.is_active = true');
      query = query.andWhere('product_sub_categories.is_active = true');
      query = query.andWhere(
        'product_sub_categories.category_sub_category_id = :category_sub_category_id',
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
      query = query.andWhere('product.is_active = true');
      query = query.andWhere('product_sub_categories.is_active = true');
      query = query.andWhere(
        'product_section_category.section_id = :section_id',
        {
          section_id,
        },
      );
    }

    const [products, total] = await query.getManyAndCount();
    return { products, total };
  }

  //* Get Single Product For Client
  async getSingleProductForClient(
    product_id: string,
    singleProductClientFilter: SingleProductClientQuery,
  ) {
    const {
      latitude,
      longitude,
      section_id,
      category_sub_category_id,
      user_id,
    } = singleProductClientFilter;
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
      .innerJoinAndSelect('product.product_images', 'product_images')
      .innerJoinAndSelect(
        'product.product_sub_categories',
        'product_sub_categories',
      )
      .innerJoinAndSelect(
        'product_sub_categories.category_subCategory',
        'product_category_subCategory',
      )
      .innerJoinAndSelect(
        'product_category_subCategory.section_category',
        'product_section_category',
      )
      .innerJoinAndSelect('product_section_category.section', 'product_section')

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
      .innerJoin(
        'product_category_prices.product_sub_category',
        'product_sub_category',
      )
      .innerJoin(
        'product_sub_category.category_subCategory',
        'category_subCategory',
      )
      .innerJoin('category_subCategory.section_category', 'section_category');

    // Get single product
    query = query.where('product.id = :product_id', { product_id });
    // Initial condition to ensure product is in at least one warehouse
    if (warehouse) {
      query = query.andWhere('warehousesProduct.warehouse_id = :warehouseId', {
        warehouseId: warehouse.id,
      });
    }
    if (user_id) {
      const cartUser = await this.cart_repo.findOne({ where: { user_id } });
      if (!cartUser) {
        throw new NotFoundException('user not found');
      }

      query = query.leftJoinAndSelect(
        'product_category_prices.cart_products',
        'cart_products',
        'cart_products.cart_id = :cart_id',
        { cart_id: cartUser.id },
      );
      query = query.leftJoinAndSelect(
        'product.products_favorite',
        'products_favorite',
        'products_favorite.user_id = :user_id',
        { user_id },
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
      query = query.andWhere('product.is_active = true');
      query = query.andWhere('product_sub_categories.is_active = true');
      query = query.andWhere(
        'product_sub_categories.category_sub_category_id = :category_sub_category_id',
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
      query = query.andWhere('product.is_active = true');
      query = query.andWhere('product_sub_categories.is_active = true');
      query = query.andWhere(
        'product_section_category.section_id = :section_id',
        {
          section_id,
        },
      );
    }
    return await query.getOne();
  }

  //* Add Or remove Product Favorite
  async productFavorite(product_id: string, section_id: string) {
    const product = await this.productRepository.findOne({
      where: { id: product_id },
    });
    if (!product) {
      throw new NotFoundException('message_product_not_found');
    }
    const section = await this.section_repo.findOne({
      where: { id: section_id },
    });
    if (!section) {
      throw new NotFoundException('message_section_not_found');
    }
    const favorite = await this.productFavorite_repo.findOne({
      where: {
        product_id,
        section_id,
        user_id: this.request.user.id,
      },
    });

    if (favorite) {
      return await this.productFavorite_repo.delete(favorite.id);
    } else {
      const newFavorite = this.productFavorite_repo.create({
        product_id,
        section_id,
        user_id: this.request.user.id,
      });
      return await this.productFavorite_repo.save(newFavorite);
    }
  }

  //* Get All Products Favorite

  async getAllProductsFavorite(productFavQuery: ProductFavQuery) {
    const { page, limit, longitude, latitude, section_id, sort, user_id } =
      productFavQuery;
    const skip = (page - 1) * limit;

    let productsSort = {};

    switch (sort) {
      case 'lowest_price':
        // Convert price to a numeric type before sorting
        (productsSort = 'product_category_prices.price'), 'ASC';
        break;
      case 'highest_price':
        (productsSort = 'product_category_prices.price'), 'DESC';
        break;
      case 'new':
        (productsSort = 'product.created_at'), 'DESC';
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
    let query = this.productFavorite_repo
      .createQueryBuilder('product_favorite')

      .innerJoinAndSelect('product_favorite.product', 'product')
      .innerJoinAndSelect('product_favorite.user', 'user')
      .innerJoinAndSelect('product_favorite.section', 'section')

      .innerJoinAndSelect('product.product_images', 'product_images')
      .innerJoinAndSelect(
        'product.product_sub_categories',
        'product_sub_categories',
      )
      .innerJoinAndSelect(
        'product_sub_categories.category_subCategory',
        'product_category_subCategory',
      )
      .innerJoinAndSelect(
        'product_category_subCategory.section_category',
        'product_section_category',
      )
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
      .innerJoin(
        'product_category_prices.product_sub_category',
        'product_sub_category',
      )
      .innerJoin(
        'product_sub_category.category_subCategory',
        'category_subCategory',
      )
      .innerJoin('category_subCategory.section_category', 'section_category')
      .orderBy('productSubCategory.order_by', 'ASC')
      .orderBy(productsSort)

      .skip(skip)
      .take(limit);

    // Modify condition if warehouse is defined
    if (warehouse) {
      query = query.andWhere('warehousesProduct.warehouse_id = :warehouseId', {
        warehouseId: warehouse.id,
      });
    }
    if (user_id) {
      const cartUser = await this.cart_repo.findOne({ where: { user_id } });
      if (!cartUser) {
        throw new NotFoundException('user not found');
      }

      query = query.leftJoinAndSelect(
        'product_category_prices.cart_products',
        'cart_products',
        'cart_products.cart_id = :cart_id',
        { cart_id: cartUser.id },
      );
      query = query.leftJoinAndSelect(
        'product.products_favorite',
        'products_favorite',
        'products_favorite.user_id = :user_id',
        { user_id },
      );
    }
    // Conditional where clause based on section
    if (section_id) {
      query = query.andWhere('section_category.section_id = :section_id', {
        section_id,
      });
      query = query.andWhere('product.is_active = true');
      query = query.andWhere('product_sub_categories.is_active = true');
      query = query.andWhere(
        'product_section_category.section_id = :section_id',
        {
          section_id,
        },
      );
    }

    query = query.andWhere('product_favorite.user_id = :user_id', {
      user_id,
    });
    const [products_favorite, total] = await query.getManyAndCount();
    return { products_favorite, total };
  }
}
