import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ProductCategoryPriceService } from './product-category-price.service';
import { ApiBearerAuth, ApiBody, ApiHeader, ApiTags } from '@nestjs/swagger';
import { ProductMeasurementRequest } from './dto/request/product-measurement.request';
import { ActionResponse } from 'src/core/base/responses/action.response';
import { ProductAdditionalServiceRequest } from './dto/request/product-additional-service.request';
@ApiBearerAuth()
@ApiHeader({
  name: 'Accept-Language',
  required: false,
  description: 'Language header: en, ar',
})
@ApiTags('Product-Category-Price')
@Controller('product-category-price')
export class ProductCategoryPriceController {
  constructor(
    private readonly productCategoryPriceService: ProductCategoryPriceService,
  ) {}

  @Post('create-link-product-subcategory/:product_id/:sub_category_id')
  async linkProductSubcategory(
    @Param('product_id') product_id: string,
    @Param('sub_category_id') sub_category_id: string,
  ) {
    return new ActionResponse(
      await this.productCategoryPriceService.createLinkProductSubcategory(
        product_id,
        sub_category_id,
      ),
    );
  }
  @Get('get-link-product-subcategory/:product_id/:sub_category_id')
  async getLinkProductSubcategory(
    @Param('product_id') product_id: string,
    @Param('sub_category_id') sub_category_id: string,
  ) {
    return new ActionResponse(
      await this.productCategoryPriceService.getLinkProductSubcategory(
        product_id,
        sub_category_id,
      ),
    );
  }

  @Delete('delete-link-product-subcategory/:product_id/:sub_category_id')
  async deleteLinkProductSubcategory(
    @Param('product_id') product_id: string,
    @Param('sub_category_id') sub_category_id: string,
  ) {
    return new ActionResponse(
      await this.productCategoryPriceService.deleteLinkProductSubcategory(
        product_id,
        sub_category_id,
      ),
    );
  }
  @Post('unit-prices-product/:product_id/:sub_category_id')
  async UnitPricesProduct(
    @Body()
    productMeasurementRequest: ProductMeasurementRequest,
    @Param('product_id') product_id: string,
    @Param('sub_category_id') sub_category_id: string,
  ) {
    return new ActionResponse(
      await this.productCategoryPriceService.unitPriceProduct(
        product_id,
        sub_category_id,
        productMeasurementRequest,
      ),
    );
  }

  @Post(
    'product-additional-service/:product_id/:sub_category_id/:product_measurement_id',
  )
  async productAdditionalService(
    @Param('product_id') product_id: string,
    @Param('sub_category_id') sub_category_id: string,
    @Param('product_measurement_id') product_measurement_id: string,
    @Body() productAdditionalServiceRequest: ProductAdditionalServiceRequest,
  ) {
    return new ActionResponse(
      await this.productCategoryPriceService.productAdditionalService(
        product_id,
        sub_category_id,
        product_measurement_id,
        productAdditionalServiceRequest,
      ),
    );
  }


}
