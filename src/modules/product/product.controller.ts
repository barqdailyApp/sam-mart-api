import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { I18nResponse } from 'src/core/helpers/i18n.helper';
import { CreateProductRequest } from './dto/request/create-product.request';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { ActionResponse } from 'src/core/base/responses/action.response';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { plainToClass } from 'class-transformer';
import { ProductResponse } from './dto/response/product.response';
@ApiTags('Product')
@Controller('product')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    @Inject(I18nResponse) private readonly _i18nResponse: I18nResponse,
  ) {}
  @Post('create-Product')
  async createProduct(@Body() createProductRequest: CreateProductRequest) {
    const product = await this.productService.create(createProductRequest);
    const productResponse = plainToClass(ProductResponse, product);

    return new ActionResponse(this._i18nResponse.entity(productResponse));
  }
  @Get('all-Products')
  async allProducts() {
    const products = await this.productService.findAll();
    const productsResponse = products.map((product) => {
      return plainToClass(ProductResponse, product);
    });
    return new ActionResponse(this._i18nResponse.entity(productsResponse));
  }
  @Get('single-Product/:product_id')
  async singleProduct(@Param('product_id') id: string) {
    const product = await this.productService.single(id);
    const productResponse = plainToClass(ProductResponse, product);

    return new ActionResponse(this._i18nResponse.entity(productResponse));
  }

  @Delete('delete-Product/:product_id')
  async deleteProduct(@Param('product_id') id: string) {
    return await this.productService.delete(id);
  }
}
