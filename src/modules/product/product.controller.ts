import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { I18nResponse } from 'src/core/helpers/i18n.helper';
import { CreateProductRequest } from './dto/request/create-product.request';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiHeader,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ActionResponse } from 'src/core/base/responses/action.response';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { plainToClass, plainToInstance } from 'class-transformer';
import { ProductResponse } from './dto/response/product.response';
import { UpdateProductRequest } from './dto/request/update-product.request';
import { UpdateProductMeasurementRequest } from './dto/request/update-product-measurement.request';
import { UpdateProductImageRequest } from './dto/request/update-product-image.request';
import { ProductFilter } from './dto/filter/product.filter';
import { CreateProductOfferRequest } from './dto/request/create-product-offer.request';
import { SingleProductRequest } from './dto/request/single-product.request';
import { ProductWarehouseResponse } from './dto/response/product-warehouse.response';
@ApiBearerAuth()
@ApiHeader({
  name: 'Accept-Language',
  required: false,
  description: 'Language header: en, ar',
})
@ApiTags('Product')
@Controller('product')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    @Inject(I18nResponse) private readonly _i18nResponse: I18nResponse,
  ) {}

  @Post('create-product')
  async createProduct(@Body() createProductRequest: CreateProductRequest) {
    const product = await this.productService.createProduct(
      createProductRequest,
    );
    const productResponse = plainToClass(ProductResponse, product);

    return new ActionResponse(this._i18nResponse.entity(productResponse));
  }

  @Post('create-product-offer/:product_category_price_id')
  async createProductOffer(
    @Param('product_category_price_id') product_category_price_id: string,
    @Body() createProductOfferRequest: CreateProductOfferRequest,
  ) {
    const product = await this.productService.createProductOffer(
      product_category_price_id,
      createProductOfferRequest,
    );
    return new ActionResponse(product);
  }

  @Put('update-product')
  async updateProduct(@Body() updateProductRequest: UpdateProductRequest) {
    const product = await this.productService.updateProduct(
      updateProductRequest,
    );
    const productResponse = plainToClass(ProductResponse, product);

    return new ActionResponse(this._i18nResponse.entity(productResponse));
  }
  @Put('update-product-measurement')
  async updateProductMeasurement(
    @Body() updateProductMeasurementRequest: UpdateProductMeasurementRequest,
  ) {
    const product = await this.productService.updateProductMeasurement(
      updateProductMeasurementRequest,
    );
    const productResponse = plainToClass(ProductResponse, product);
    return new ActionResponse(this._i18nResponse.entity(productResponse));
  }

  @Put('update-product-image')
  async updateProductImage(
    @Body() updateProductImageRequest: UpdateProductImageRequest,
  ) {
    const product = await this.productService.updateProductImage(
      updateProductImageRequest,
    );
    const productResponse = plainToClass(ProductResponse, product);
    return new ActionResponse(this._i18nResponse.entity(productResponse));
  }

  @Get('all-products')
  async allProducts(@Query() productFilter: ProductFilter) {
    const products = await this.productService.AllProduct(productFilter);
    const productsResponse = products.map((product) => {
      return plainToClass(ProductResponse, product);
    });
    return new ActionResponse(this._i18nResponse.entity(productsResponse));
  }

  @Get(':categorySubCategory_id/all-products')
  async subCategoryAllProducts(
    @Query() productFilter: ProductFilter,
    @Param('categorySubCategory_id') categorySubCategory_id: string,
  ) {
    const products = await this.productService.subCategoryAllProducts(
      productFilter,
      categorySubCategory_id,
    );
    //   console.log('first item', products[0]);
    const productsResponse = products.map((product) => {
  const productResponse = plainToClass(ProductResponse, product);
      productResponse.totalQuantity =
        productResponse.warehouses_products.reduce(
          (acc, cur) => acc + cur.quantity,
          0,
        );
      return productResponse;
    });
    return new ActionResponse(this._i18nResponse.entity(productsResponse));
  }

  @Get('single-product/:product_id')
  async singleProduct(
    @Param('product_id') id: string,
    @Query() singleProductRequest: SingleProductRequest,
  ) {
    const product = await this.productService.singleProduct(
      id,
      singleProductRequest,
    );
    const productResponse = plainToClass(ProductResponse, product);

    return new ActionResponse(this._i18nResponse.entity(productResponse));
  }

  @Delete('delete-Product/:product_id')
  async deleteProduct(@Param('product_id') id: string) {
    return await this.productService.deleteProduct(id);
  }

  @Delete('delete-Product-image/:product_id/:image_id')
  async deleteProductImage(
    @Param('product_id') product_id: string,
    @Param('image_id') image_id: string,
  ) {
    return await this.productService.deleteProductImage(product_id, image_id);
  }
  @Delete('delete-Product-measurement/:product_id/:measurement_id')
  async deleteProductMeasurement(
    @Param('product_id') product_id: string,
    @Param('measurement_id') measurement_id: string,
  ) {
    return await this.productService.deleteProductMeasurement(
      product_id,
      measurement_id,
    );
  }
}
