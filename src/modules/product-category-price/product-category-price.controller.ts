import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ProductCategoryPriceService } from './product-category-price.service';
import { ApiBearerAuth, ApiBody, ApiHeader, ApiTags } from '@nestjs/swagger';
import { ProductMeasurementRequest } from './dto/request/product-measurement.request';
import { ActionResponse } from 'src/core/base/responses/action.response';
import { ProductAdditionalServiceRequest } from './dto/request/product-additional-service.request';
import { plainToClass } from 'class-transformer';
import { ProductCategoryPriceResponse } from '../product/dto/response/product-category-price.response';
import { CreateLinkProductSubcategoryRequest } from './dto/request/create-link-product-subcateory.request';
import { UpdateLinkProductSubcategoryRequest } from './dto/request/update-link-product-subcateory.request';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { Roles } from '../authentication/guards/roles.decorator';
import { RolesGuard } from '../authentication/guards/roles.guard';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
@ApiBearerAuth()
@ApiHeader({
  name: 'Accept-Language',
  required: false,
  description: 'Language header: en, ar',
})
@ApiTags('Product-Category-Price')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('product-category-price')
export class ProductCategoryPriceController {
  constructor(
    private readonly productCategoryPriceService: ProductCategoryPriceService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Post('create-link-product-subcategory/:product_id/:categorySubCategory_id')
  async linkProductSubcategory(
    @Body()
    createLinkProductSubcategoryRequest: CreateLinkProductSubcategoryRequest,
  ) {
    this.cacheManager.reset();
    return new ActionResponse(
      await this.productCategoryPriceService.createLinkProductSubcategory(
        createLinkProductSubcategoryRequest,
      ),
    );
  }

  @Put('update-link-product-subcategory/:product_sub_category_id')
  async updateLinkProductSubcategory(
    @Param('product_sub_category_id') product_sub_category_id: string,
    @Body()
    updateLinkProductSubcategoryRequest: UpdateLinkProductSubcategoryRequest,
  ) {
    this.cacheManager.reset();
    return new ActionResponse(
      await this.productCategoryPriceService.updateLinkProductSubcategory(
        product_sub_category_id,
        updateLinkProductSubcategoryRequest,
      ),
    );
  }
  @Get('get-link-product-subcategory/:product_id/:categorySubCategory_id')
  async getLinkProductSubcategory(
    @Param('product_id') product_id: string,
    @Param('categorySubCategory_id') categorySubCategory_id: string,
  ) {
    return new ActionResponse(
      await this.productCategoryPriceService.getLinkProductSubcategory(
        product_id,
        categorySubCategory_id,
      ),
    );
  }

  @Delete('delete-link-product-subcategory/:product_sub_category_id')
  async deleteLinkProductSubcategory(
    @Param('product_sub_category_id') product_sub_category_id: string,
  ) {
    this.cacheManager.reset();
    return new ActionResponse(
      await this.productCategoryPriceService.deleteLinkProductSubcategory(
        product_sub_category_id,
      ),
    );
  }

  @Get('unit-prices-product/:product_sub_category_id')
  async AllUnitPricesProduct(
    @Param('product_sub_category_id') product_sub_category_id: string,
  ) {
    const result =
      await this.productCategoryPriceService.getAllUnitPriceProduct(
        product_sub_category_id,
      );
    const ResultDto = result.map((x) =>
      plainToClass(ProductCategoryPriceResponse, x),
    );
    return new ActionResponse(ResultDto);
  }
  @Post('unit-prices-product/:product_sub_category_id')
  async UnitPricesProduct(
    @Body()
    productMeasurementRequest: ProductMeasurementRequest,
    @Param('product_sub_category_id') product_sub_category_id: string,
  ) {
    this.cacheManager.reset();
    return new ActionResponse(
      await this.productCategoryPriceService.unitPriceProduct(
        product_sub_category_id,
        productMeasurementRequest,
      ),
    );
  }

  @Post(
    'product-additional-service/:product_sub_category_id/:product_measurement_id',
  )
  async productAdditionalService(
    @Param('product_sub_category_id') product_sub_category_id: string,
    @Param('product_measurement_id') product_measurement_id: string,
    @Body() productAdditionalServiceRequest: ProductAdditionalServiceRequest,
  ) {
    this.cacheManager.reset();
    return new ActionResponse(
      await this.productCategoryPriceService.productAdditionalService(
        product_sub_category_id,
        product_measurement_id,
        productAdditionalServiceRequest,
      ),
    );
  }
  @Delete(
    'product-additional-service/:product_additional_service_id',
  )
  async deleteProductAdditionalService(
    @Param('product_additional_service_id') product_additional_service_id: string
  ) {
    this.cacheManager.reset();
    return new ActionResponse(
      await this.productCategoryPriceService.deleteProductAdditionalService(
        product_additional_service_id
      ),
    );
  }
}
