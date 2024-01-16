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
    @InjectRepository(SectionCategory)
    private readonly sectionCategory_repo: Repository<SectionCategory>,

    @InjectRepository(Subcategory)
    private readonly subCategory_repo: Repository<Subcategory>,

    @InjectRepository(CategorySubCategory)
    private readonly categorySubCategory_repo: Repository<CategorySubCategory>,
    //
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
      for (const measurement of product.product_measurements) {
        const measurement_unit = await this.measurementUnit_repo.findOne({
          where: { name_en: measurement.measurement_unit.name_en },
        });
        const createProductMeasurement = this.productMeasurement_repo.create({
          conversion_factor: measurement.conversion_factor,
          product_id: productSaved.id,
          measurement_unit_id: measurement_unit.id,
          is_main_unit: measurement.is_main_unit,
        });

        if (measurement.is_main_unit == true) {
          createProductMeasurement.base_unit_id = measurement_unit.id;
        }

        await this.productMeasurement_repo.save(createProductMeasurement);
      }
    }

    //* Link Products with subcategory
    const products = await this.product_repo.find();

    const sections = await this.section_repo.find({
      relations: { section_categories: { category_subCategory: true } },
    });
    // sam-mart
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
    // sam-restaurant
    for (let i = 0; i < sections.length; i++) {
      const category_subCategory =
        sections[i].section_categories[1].category_subCategory[0];
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
    // console.log(productSubCategory.length);
    // console.log(additionalService.length);

    // for (let i = 0; 1 < 1; i++) {
    //   const productMeasurement = await this.productMeasurement_repo.find({
    //     where: { product_id: productSubCategory[i].product_id },
    //   });
    //   console.log(productMeasurement);
    //   for (let j = 0; 1 < 1; j++) {
    //     for (let k = 0; 1 < 1; k++) {
    //       const productCategoryPrice =
    //         await this.productCategoryPrice_repo.findOne({
    //           where: {
    //             product_measurement_id: productMeasurement[j].id,
    //             product_sub_category_id: productSubCategory[i].id,
    //           },
    //         });
    //       console.log(productCategoryPrice);
    //       const createProductAdditionalService =
    //         this.productService_repo.create({
    //           product_category_price_id: productCategoryPrice.id,
    //           additional_service_id: additionalService[k].id,
    //           price: Math.floor(Math.random() * 100) + 1,
    //         });
    //       console.log(createProductAdditionalService);
    //       await this.productService_repo.save(createProductAdditionalService);
    //     }
    //   }
    // }
    const productMeasurement = await this.productMeasurement_repo.find({
      where: { product_id: productSubCategory[0].product_id },
    });
    const productCategoryPrice = await this.productCategoryPrice_repo.findOne({
      where: {
        product_measurement_id: productMeasurement[0].id,
        product_sub_category_id: productSubCategory[0].id,
      },
    });

    const createProductAdditionalService = this.productService_repo.create({
      product_category_price_id: productCategoryPrice.id,

      additional_service_id: additionalService[0].id,
      price: Math.floor(Math.random() * 100) + 1,
    });

    await this.productService_repo.save(createProductAdditionalService);
  }

  async drop(): Promise<any> {
    // await this.productCategoryPrice_repo.delete({});

    // await this.productSubCategory_repo.delete({});
    // await this.productMeasurement_repo.delete({});
    // await this.categorySubCategory_repo.delete({});

    // await this.subCategory_repo.delete({});

    // await this.sectionCategory_repo.delete({});
    // // await this.section_repo.delete({});

    // // await this.productService_repo.delete({});
    // // await this.additionalService_repo.delete({});
    return await this.product_repo.delete({});
  }
}
