import {
  ConflictException,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { plainToClass } from 'class-transformer';
import { ActionResponse } from 'src/core/base/responses/action.response';
import { I18nResponse } from 'src/core/helpers/i18n.helper';
import { PageMetaDto } from 'src/core/helpers/pagination/page-meta.dto';
import { PageDto } from 'src/core/helpers/pagination/page.dto';
import { ProductClientQuery } from './dto/filter/products-client.query';
import { SingleProductClientQuery } from './dto/filter/single-product-client.query';
import { ProductResponse } from './dto/response/product.response';
import { ProductClientService } from './product-client.service';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { RolesGuard } from '../authentication/guards/roles.guard';
import { ProductFavResponse } from './dto/response/product-fav.response';
import { ProductFavQuery } from './dto/filter/product-fav.query';
import { ProductsOffersNewResponse } from './dto/response/response-client/products-offers-new.response';
import { ProductsNewResponse } from './dto/response/response-client/products-new.response';
import { SingleProductsNewResponse } from './dto/response/response-client/single-product-new.response';

@ApiBearerAuth()
@ApiHeader({
  name: 'Accept-Language',
  required: false,
  description: 'Language header: en, ar',
})
@ApiTags('Product')
@Controller('product')
export class ProductClientController {
  constructor(
    private readonly productClientService: ProductClientService,

    @Inject(I18nResponse) private readonly _i18nResponse: I18nResponse,
  ) {}
  @Get('all-products-for-client')
  async allProductsForClient(@Query() productClientFilter: ProductClientQuery) {
    const { limit, page } = productClientFilter;

    const { products, total } =
      await this.productClientService.getAllProductsForClient(
        productClientFilter,
      );

    const productsResponse = products.map((product) => {
      const productResponse = new ProductsNewResponse(product);

      return productResponse;
    });
    const pageMetaDto = new PageMetaDto(page, limit, total);
    const data = this._i18nResponse.entity(productsResponse);
    const pageDto = new PageDto(data, pageMetaDto);

    return new ActionResponse(pageDto);
  }


  @Get('all-products-offers-for-client')
  async allProductsOffersForClient(
    @Query() productClientFilter: ProductClientQuery,
  ) {
    const { limit, page } = productClientFilter;

    const { products, total } =
      await this.productClientService.getAllProductsOffersForClient(
        productClientFilter,
      );
    const productsResponse = products.map((product) => {
      const productResponse = new ProductsOffersNewResponse(product);
      return productResponse;
    });
    const pageMetaDto = new PageMetaDto(page, limit, total);
    const data = this._i18nResponse.entity(productsResponse);
    const pageDto = new PageDto(data, pageMetaDto);

    return new ActionResponse(pageDto);
  }

  @Get('single-product-client/:product_id')
  async singleProductClient(
    @Param('product_id') id: string,
    @Query() singleProductClientQuery: SingleProductClientQuery,
  ) {
    const product = await this.productClientService.getSingleProductForClient(
      id,
      singleProductClientQuery,
    );
    const productResponse =new SingleProductsNewResponse(product);
    if (product?.warehouses_products == null) {
      throw new ConflictException('Product is not available In Warehouse');
    }

    return new ActionResponse(this._i18nResponse.entity(productResponse));
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('all-Product-favorite')
  async allProductFavorite(@Query() productFavQuery: ProductFavQuery) {
    const { limit, page } = productFavQuery;

    const { products_favorite, total } =
      await this.productClientService.getAllProductsFavorite(productFavQuery);
    const productsResponse = products_favorite.map((product_fav) => {
      const productResponse =new ProductsNewResponse(product_fav.product);

      return productResponse;
    });
    const pageMetaDto = new PageMetaDto(page, limit, total);
    const data = this._i18nResponse.entity(productsResponse);
    const pageDto = new PageDto(data, pageMetaDto);

    return new ActionResponse(pageDto);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('product-favorite/:product_id/:section_id')
  async productFavorite(
    @Param('product_id') product_id: string,
    @Param('section_id') section_id: string,
  ) {
    const product = await this.productClientService.productFavorite(
      product_id,
      section_id,
    );

    return new ActionResponse(product);
  }
}
