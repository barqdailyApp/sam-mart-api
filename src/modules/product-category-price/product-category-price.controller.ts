import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { ProductCategoryPriceService } from './product-category-price.service';
import { ProductCategoryPrice } from 'src/infrastructure/entities/product/product-category-price.entity';
import { CreateProductCategoryPriceRequest } from './dto/request/create-product-category-price.request';
import { ApiTags } from '@nestjs/swagger';
import { ActionResponse } from 'src/core/base/responses/action.response';
import { UpdateProductCategoryPriceRequest } from './dto/request/update-product-category-price.request';
@ApiTags('Product-Category-Price')
@Controller('product-category-price')
export class ProductCategoryPriceController {
  constructor(
    private readonly productCategoryPriceService: ProductCategoryPriceService,
  ) {}

  @Get('all-product-category-price')
  async findAll() {
    return new ActionResponse(await this.productCategoryPriceService.findAll());
  }

  @Post('create-product-category-price')
  async create(
    @Body()
    createProductCategoryPriceRequest: CreateProductCategoryPriceRequest,
  ) {
    return new ActionResponse(
      await this.productCategoryPriceService.create(
        createProductCategoryPriceRequest,
      ),
    );
  }

  @Put('update-product-category-price')
  async update(
    @Body() updateProductCategoryPriceRequest: UpdateProductCategoryPriceRequest,
  ){
    return new ActionResponse(
      await this.productCategoryPriceService.update(
        updateProductCategoryPriceRequest,
      ),
    );
  }
}
