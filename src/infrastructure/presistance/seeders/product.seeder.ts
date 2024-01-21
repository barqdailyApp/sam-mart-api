import { Injectable } from '@nestjs/common';
import { Seeder, DataFactory } from 'nestjs-seeder';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/infrastructure/entities/user/user.entity';
import { Address } from 'src/infrastructure/entities/user/address.entity';
import { Country } from 'src/infrastructure/entities/country/country.entity';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { City } from 'src/infrastructure/entities/city/city.entity';
import { Region } from 'src/infrastructure/entities/region/region.entity';
import { MeasurementUnit } from 'src/infrastructure/entities/product/measurement-unit.entity';
import { Product } from 'src/infrastructure/entities/product/product.entity';
import { ProductImage } from 'src/infrastructure/entities/product/product-image.entity';
import { ProductMeasurement } from 'src/infrastructure/entities/product/product-measurement.entity';
import { Subcategory } from 'src/infrastructure/entities/category/subcategory.entity';
import { ProductSubCategory } from 'src/infrastructure/entities/product/product-sub-category.entity';
import { ProductCategoryPrice } from 'src/infrastructure/entities/product/product-category-price.entity';
import { ProductAdditionalService } from 'src/infrastructure/entities/product/product-additional-service.entity';
import { AdditionalService } from 'src/infrastructure/entities/product/additional-service.entity';
import { CategorySubCategory } from 'src/infrastructure/entities/category/category-subcategory.entity';
import { Section } from 'src/infrastructure/entities/section/section.entity';
import { SectionCategory } from 'src/infrastructure/entities/section/section-category.entity';
import { Category } from 'src/infrastructure/entities/category/category.entity';

@Injectable()
export class ProductSeeder implements Seeder {
  constructor(
    @InjectRepository(Section)
    private readonly section_repo: Repository<Section>,
    @InjectRepository(Product)
    private readonly product_repo: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImage_repo: Repository<ProductImage>,
    @InjectRepository(ProductMeasurement)
    private readonly productMeasurement_repo: Repository<ProductMeasurement>,
    @InjectRepository(MeasurementUnit)
    private readonly measurementUnit_repo: Repository<MeasurementUnit>,

    @InjectRepository(ProductSubCategory)
    private readonly productSubCategory_repo: Repository<ProductSubCategory>,
    @InjectRepository(ProductCategoryPrice)
    private readonly productCategoryPrice_repo: Repository<ProductCategoryPrice>,
    @InjectRepository(AdditionalService)
    private readonly additionalService_repo: Repository<AdditionalService>,
    @InjectRepository(ProductAdditionalService)
    private readonly productService_repo: Repository<ProductAdditionalService>,
  ) {}

  async seed(): Promise<any> {
    //* Create Product only without link with subcategory and set price
    const data = fs.readFileSync('./json/product.json', 'utf8');
    const productsJson: Product[] = JSON.parse(data);

    for (const product of productsJson) {
      const createProduct = this.product_repo.create({
        name_ar: product.name_ar,
        name_en: product.name_en,
        description_ar: product.description_ar,
        description_en: product.description_en,

        is_active: product.is_active,
        is_recovered: product.is_recovered,
      });
      const productSaved = await this.product_repo.save(createProduct);
      for (const image of product.product_images) {
        const createProductImage = this.productImage_repo.create({
          url: image.url,
          is_logo: image.is_logo,
          product_id: productSaved.id,
        });
        await this.productImage_repo.save(createProductImage);
      }

      //* Create Primary Product Measurement
      const primaryUnit = product.product_measurements.find(
        (measurement) => measurement.is_main_unit,
      );
      const main_measurement_unit = await this.measurementUnit_repo.findOne({
        where: { name_en: primaryUnit.measurement_unit.name_en },
      });
      const createPrimaryProductMeasurement =
        this.productMeasurement_repo.create({
          conversion_factor: primaryUnit.conversion_factor,
          measurement_unit_id:main_measurement_unit.id,
          product_id: productSaved.id,
          is_main_unit: primaryUnit.is_main_unit,
        });
      const primaryProductMeasurement = await this.productMeasurement_repo.save(
        createPrimaryProductMeasurement,
      );

      //* Create Secondary Product Measurements
      const secondaryMeasurements = product.product_measurements.filter(
        (measurement) => !measurement.is_main_unit,
      );

      for (const measurement of secondaryMeasurements) {
        const measurement_unit = await this.measurementUnit_repo.findOne({
          where: { name_en: measurement.measurement_unit.name_en },
        });
        const createProductMeasurement = this.productMeasurement_repo.create({
          conversion_factor: measurement.conversion_factor,
          product_id: productSaved.id,
          measurement_unit_id: measurement_unit.id,
          is_main_unit: measurement.is_main_unit,
        });

        if (measurement.is_main_unit == false) {
          createProductMeasurement.base_unit_id = main_measurement_unit.id;
        }

        await this.productMeasurement_repo.save(createProductMeasurement);
      }
    }

    //* Link Products with subcategory
    const products = await this.product_repo.find();

    const sections = await this.section_repo.find({
      relations: { section_categories: { category_subCategory: true } },
    });

    for (let i = 0; i < sections.length; i++) {
      const category_subCategory =
        sections[i].section_categories[0].category_subCategory[0];
      for (let j = 0; j < products.length; j++) {
        const createProductSubCategory = this.productSubCategory_repo.create({
          product_id: products[j].id,
          order_by: j + 1,
          category_sub_category_id: category_subCategory.id,
        });
        await this.productSubCategory_repo.save(createProductSubCategory);
      }
    }

    //* Link Product Sub Category with product measurement and price
    const productSubCategory = await this.productSubCategory_repo.find();
    for (let i = 0; i < productSubCategory.length; i++) {
      const productMeasurement = await this.productMeasurement_repo.find({
        where: { product_id: productSubCategory[i].product_id },
      });
      for (let j = 0; j < productMeasurement.length; j++) {
        const createProductCategoryPrice =
          this.productCategoryPrice_repo.create({
            product_measurement_id: productMeasurement[j].id,
            product_sub_category_id: productSubCategory[i].id,
            price: Math.floor(Math.random() * 100) + 1, // Returns a random integer from 1 to 100:
            min_order_quantity: Math.floor(Math.random() * 10) + 1,
            max_order_quantity: Math.floor(Math.random() * 30) + 11,
          });
        await this.productCategoryPrice_repo.save(createProductCategoryPrice);
      }
    }
    //* Add Additional Services To Product Measurement
    const additionalService = await this.additionalService_repo.find();

    const productCategoryPriceFull =
      await this.productCategoryPrice_repo.find();
    for (let index = 0; index < productCategoryPriceFull.length; index++) {
      const createProductAdditionalService = this.productService_repo.create({
        product_category_price_id: productCategoryPriceFull[index].id,

        additional_service_id: additionalService[0].id,
        price: Math.floor(Math.random() * 100) + 1,
      });

      await this.productService_repo.save(createProductAdditionalService);
    }
  }

  async drop(): Promise<any> {
    // Delete ProductCategoryPrice records related to products
    await this.productCategoryPrice_repo.delete({});
  
    // Delete ProductSubCategory records related to products
    await this.productSubCategory_repo.delete({});
  
    // Delete ProductMeasurement records related to products
    await this.productMeasurement_repo.delete({});
  
    // Delete ProductImage records related to products
    await this.productImage_repo.delete({});
  
    // Delete ProductService records related to products
    await this.productService_repo.delete({});
  
    // Finally, delete Product records
    return await this.product_repo.delete({});
  }
  
}
