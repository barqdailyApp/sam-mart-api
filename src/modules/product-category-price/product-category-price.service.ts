import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductCategoryPrice } from 'src/infrastructure/entities/product/product-category-price.entity';
import { Repository } from 'typeorm';
import { Product } from 'src/infrastructure/entities/product/product.entity';
import { Subcategory } from 'src/infrastructure/entities/category/subcategory.entity';
import { ProductSubCategory } from 'src/infrastructure/entities/product/product-sub-category.entity';
import { ProductMeasurementRequest } from './dto/request/product-measurement.request';
import { ProductMeasurement } from 'src/infrastructure/entities/product/product-measurement.entity';
import { AdditionalService } from 'src/infrastructure/entities/product/additional-service.entity';
import { ProductAdditionalServiceRequest } from './dto/request/product-additional-service.request';
import { ProductAdditionalService } from 'src/infrastructure/entities/product/product-additional-service.entity';
import { CategorySubCategory } from 'src/infrastructure/entities/category/category-subcategory.entity';

@Injectable()
export class ProductCategoryPriceService {
  constructor(
    @InjectRepository(ProductCategoryPrice)
    private productCategoryPrice_repo: Repository<ProductCategoryPrice>,
    @InjectRepository(Product)
    private product_repo: Repository<Product>,
    @InjectRepository(CategorySubCategory)
    private categorySubcategory_repo: Repository<CategorySubCategory>,
    @InjectRepository(ProductSubCategory)
    private productSubCategory_repo: Repository<ProductSubCategory>,
    @InjectRepository(ProductMeasurement)
    private productMeasurement_repo: Repository<ProductMeasurement>,

    @InjectRepository(AdditionalService)
    private additionalService_repo: Repository<AdditionalService>,

    @InjectRepository(ProductAdditionalService)
    private productService_repo: Repository<ProductAdditionalService>,
  ) {}

  async createLinkProductSubcategory(
    product_id: string,
    categorySubCategory_id: string,
  ) {
    //*--------------------------------- Make Check For User Data ---------------------------------*/
    //* Check if sub category exist
    const categorySubcategory = await this.categorySubcategory_repo.findOne({
      relations: { section_category: true },
      where: { id: categorySubCategory_id },
    });
    if (!categorySubcategory) {
      throw new NotFoundException(`Subcategory ID not found`);
    }

    //* Check if product exist
    const product = await this.product_repo.findOne({
      where: { id: product_id },
    });
    if (!product) {
      throw new NotFoundException(`Product ID not found`);
    }
    //* Check if product  there is a section
    const sectionSubcategory = categorySubcategory.section_category.section_id;
    const productSection = await this.product_repo.findOne({
      where: {
        id: product_id,
        product_sub_categories: {
          category_subCategory: {
            section_category: {
              section_id: sectionSubcategory,
            },
          },
        },
      },
    });

    if (productSection) {
      throw new BadRequestException(
        `This product cannot be added in the same section`,
      );
    }

    // //* Check if product sub category exist
    // const productSubCategory = await this.productSubCategory_repo.findOne({
    //   where: {
    //     product_id,
    //     category_sub_category_id: categorySubCategory_id,
    //   },
    // });
    // if (productSubCategory) {
    //   throw new BadRequestException(
    //     `There Relation Between Product And Sub Category`,
    //   );
    // }

    //* -------------------------- Create product sub category if Not Exist --------------------------*/
    const productSubCategoryCreate = this.productSubCategory_repo.create({
      product_id,
      category_sub_category_id: categorySubCategory_id,
    });
    return await this.productSubCategory_repo.save(productSubCategoryCreate);
  }

  async getLinkProductSubcategory(
    product_id: string,
    categorySubCategory_id: string,
  ) {
    //*--------------------------------- Make Check For User Data ---------------------------------*/
    //* Check if sub category exist
    const categorySubcategory = await this.categorySubcategory_repo.findOne({
      where: { id: categorySubCategory_id },
    });
    if (!categorySubcategory) {
      throw new NotFoundException(`Subcategory ID not found`);
    }
    //* Check if product exist
    const product = await this.product_repo.findOne({
      where: { id: product_id },
    });
    if (!product) {
      throw new NotFoundException(`Product ID not found`);
    }
    //* -------------------------- Return This Relation  if Exist --------------------------*/
    const productSubCategory = await this.productSubCategory_repo.findOne({
      where: {
        product_id,
        category_sub_category_id: categorySubCategory_id,
      },
    });
    if (!productSubCategory) {
      throw new NotFoundException(
        `No Relation Between Product And Sub Category`,
      );
    }
    return productSubCategory;
  }

  async deleteLinkProductSubcategory(product_sub_category_id: string) {
    const productSubCategory = await this.productSubCategory_repo.findOne({
      where: {
        id: product_sub_category_id,
      },
    });
    if (!productSubCategory) {
      throw new NotFoundException(
        `No Relation Between Product And Sub Category`,
      );
    }
    return await this.productSubCategory_repo.remove(productSubCategory);
  }

  async getAllUnitPriceProduct(product_sub_category_id: string) {
    const productSubCategory = await this.productSubCategory_repo.findOne({
      where: {
        id: product_sub_category_id,
      },
    });
    if (!productSubCategory) {
      throw new NotFoundException(`Product sub category ID not found`);
    }
    return await this.productCategoryPrice_repo.find({
      where: {
        product_sub_category_id: product_sub_category_id,
      },
      relations: {
        product_measurement: true,
        product_additional_services: {
          additional_service: true,
        },
      },
    });
  }
  async unitPriceProduct(
    product_sub_category_id: string,
    measurement_detail: ProductMeasurementRequest,
  ) {
    const {
      product_measurement_id,
      price,
      min_order_quantity,
      max_order_quantity,
    } = measurement_detail;
    //*--------------------------------- Make Check For User Data ---------------------------------*/
    //* Check if product sub category id exist
    const productSubCategory = await this.productSubCategory_repo.findOne({
      where: {
        id: product_sub_category_id,
      },
    });
    if (!productSubCategory) {
      throw new NotFoundException(`Product sub category ID not found`);
    }
    //* Check  product measurement id
    const productMeasurement = await this.productMeasurement_repo.findOne({
      where: { id: product_measurement_id },
    });
    if (!productMeasurement) {
      throw new NotFoundException('Product Measurement not found');
    }

    //*-------------------------- Check if product category price exist , will update it -------------------*/
    const productCategoryPrice = await this.productCategoryPrice_repo.findOne({
      where: {
        product_measurement_id: product_measurement_id,
        product_sub_category_id: productSubCategory.id,
      },
    });
    if (productCategoryPrice) {
      productCategoryPrice.price = price;
      productCategoryPrice.min_order_quantity = min_order_quantity;
      productCategoryPrice.max_order_quantity = max_order_quantity;
      return await this.productCategoryPrice_repo.save(productCategoryPrice);
    }
    //* -------------------------- Create product category price if Not Exist --------------------------*/

    const createProductCategoryPrice = this.productCategoryPrice_repo.create({
      product_measurement_id,
      product_sub_category_id: productSubCategory.id,
      price,
      min_order_quantity,
      max_order_quantity,
    });
    return await this.productCategoryPrice_repo.save(
      createProductCategoryPrice,
    );
  }

  async productAdditionalService(
    product_sub_category_id: string,
    product_measurement_id: string,
    productAdditionalServiceRequest: ProductAdditionalServiceRequest,
  ) {
    const { additional_service_id, price } = productAdditionalServiceRequest;
    //*--------------------------------- Make Check For User Data ---------------------------------*/

    //* Check if product sub category id exist
    const productSubCategory = await this.productSubCategory_repo.findOne({
      where: { id: product_sub_category_id },
    });
    if (!productSubCategory) {
      throw new NotFoundException(`Product sub category ID not found`);
    }

    //* Check  product measurement id
    const productMeasurement = await this.productMeasurement_repo.findOne({
      where: { id: product_measurement_id },
    });
    if (!productMeasurement) {
      throw new NotFoundException('Product Measurement not found');
    }
    //* check if additional service id
    const additionalService = await this.additionalService_repo.findOne({
      where: { id: additional_service_id },
    });
    if (!additionalService) {
      throw new NotFoundException('Additional Service not found');
    }

    //* check if product category price exist
    const productCategoryPrice = await this.productCategoryPrice_repo.findOne({
      where: {
        product_measurement_id: product_measurement_id,
        product_sub_category_id: productSubCategory.id,
      },
    });
    if (!productCategoryPrice) {
      throw new NotFoundException('Product Category Price not found');
    }
    //* -------------------------- Check if product additional service exist , will update it -------------------*/

    const productAdditionalService = await this.productService_repo.findOne({
      where: {
        product_category_price_id: productCategoryPrice.id,
        additional_service_id: additionalService.id,
      },
    });
    if (productAdditionalService) {
      productAdditionalService.price = price;

      return await this.productService_repo.save(productAdditionalService);
    }
    //* -------------------------- Create product additional service --------------------------*/

    const createProductAdditionalService = this.productService_repo.create({
      product_category_price_id: productCategoryPrice.id,

      additional_service_id: additionalService.id,
      price,
    });
    return await this.productService_repo.save(createProductAdditionalService);
  }
}
