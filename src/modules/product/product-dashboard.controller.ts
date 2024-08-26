import {
  Body,
  ClassSerializerInterceptor,
  ConflictException,
  Controller,
  Delete,
  Get,
  Header,
  Inject,
  Param,
  Post,
  Put,
  Query,
  Res,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProductDashboardService } from './product-dashboard.service';
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
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { plainToClass, plainToInstance } from 'class-transformer';
import { ProductResponse } from './dto/response/product.response';
import { UpdateProductRequest } from './dto/request/update-product.request';
import { UpdateProductMeasurementRequest } from './dto/request/update-product-measurement.request';
import { ProductsDashboardQuery } from './dto/filter/products-dashboard.query';
import { CreateProductOfferRequest } from './dto/request/create-product-offer.request';
import { SingleProductRequest } from './dto/request/single-product.request';
import { ProductWarehouseResponse } from './dto/response/product-warehouse.response';
import { PageMetaDto } from 'src/core/helpers/pagination/page-meta.dto';
import { PageDto } from 'src/core/helpers/pagination/page.dto';
import { CreateSingleImageRequest } from './dto/request/product-images/create-single-image.request';
import { UpdateSingleImageRequest } from './dto/request/product-images/update-single-image.request';
import { CreateProductMeasurementRequest } from './dto/request/create-product-measurement.request';
import { ProductClientQuery } from './dto/filter/products-client.query';
import { SingleProductClientQuery } from './dto/filter/single-product-client.query';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { RolesGuard } from '../authentication/guards/roles.guard';
import { Roles } from '../authentication/guards/roles.decorator';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { query, Response } from 'express';
import { ImportCategoryRequest } from '../category/dto/requests/import-category-request';
import { UploadValidator } from 'src/core/validators/upload.validator';
import { ProductClientService } from './product-client.service';
import { SingleProductDashboardQuery } from './dto/filter/single-product-dashboard.query';
import { ProductsDashboardNewResponse } from './dto/response/response-dashboard/products-dashboard-new.response';
import { SingleProductDashboardNewResponse } from './dto/response/response-dashboard/single-product-dashboard-new.response';
import { ProductsOffersDashboardNewResponse } from './dto/response/response-dashboard/products-offers-dashboard-new.response';
import { UpdateProductOfferRequest } from './dto/request/update-product-offer.request';
import { CreateBanarRequest } from '../banar/dto/request/create-banar.request';
import { CreateBrandRequest, LinkBrandProuductRequest } from './dto/request/create-brand.request';
import { BrandService } from './brand.service';
import { PaginatedRequest } from 'src/core/base/requests/paginated.request';
import { PaginatedResponse } from 'src/core/base/responses/paginated.response';
import { toUrl } from 'src/core/helpers/file.helper';
@ApiBearerAuth()
@ApiHeader({
  name: 'Accept-Language',
  required: false,
  description: 'Language header: en, ar',
})
@ApiTags('Product')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('product')
@Roles(Role.ADMIN)
export class ProductDashboardController {
  constructor(
    private readonly productDashboardService: ProductDashboardService,
    private readonly productClientService: ProductClientService,
    private readonly brandService: BrandService,

    @Inject(I18nResponse) private readonly _i18nResponse: I18nResponse,
  ) {}

  @Post('create-product')
  async createProduct(@Body() createProductRequest: CreateProductRequest) {
    const product = await this.productDashboardService.createProduct(
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
    const product = await this.productDashboardService.createProductOffer(
      product_category_price_id,
      createProductOfferRequest,
    );
    return new ActionResponse(product);
  }
  @Put('update-product-offer/:offer_id')
  async updateProductOffer(
    @Param('offer_id') offer_id: string,
    @Body() updateProductOfferRequest: UpdateProductOfferRequest,
  ) {
    const product = await this.productDashboardService.updateProductOffer(
      offer_id,
      updateProductOfferRequest,
    );
    return new ActionResponse(product);
  }
  @Delete('delete-product-offer/:offer_id')
  async deleteProductOffer(@Param('offer_id') offer_id: string) {
    const product = await this.productDashboardService.deleteProductOffer(
      offer_id,
    );
    return new ActionResponse(product);
  }

  @Post('add-image-to-product/:product_id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async addImageToProduct(
    @Param('product_id') id: string,
    @Body() createSingleImageRequest: CreateSingleImageRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    createSingleImageRequest.file = file;
    const product = await this.productDashboardService.addProductImage(
      id,
      createSingleImageRequest,
    );
    return new ActionResponse(product);
  }

  @Post('add-measurement-to-product/:product_id')
  async addMeasurementToProduct(
    @Param('product_id') product_id: string,
    @Body() createProductMeasurementRequest: CreateProductMeasurementRequest,
  ) {
    const product = await this.productDashboardService.addProductMeasurement(
      product_id,
      createProductMeasurementRequest,
    );
    return new ActionResponse(product);
  }

  @Put('update-product/:product_id')
  async updateProduct(
    @Param('product_id') product_id: string,
    @Body() updateProductRequest: UpdateProductRequest,
  ) {
    const product = await this.productDashboardService.updateProduct(
      product_id,
      updateProductRequest,
    );
    const productResponse = plainToClass(ProductResponse, product);

    return new ActionResponse(this._i18nResponse.entity(productResponse));
  }
  @Put('update-product-measurement/:product_id/:product_measurement_unit_id')
  async updateProductMeasurement(
    @Param('product_id') product_id: string,
    @Param('product_measurement_unit_id') product_measurement_unit_id: string,
    @Body() updateProductMeasurementRequest: UpdateProductMeasurementRequest,
  ) {
    const product = await this.productDashboardService.updateProductMeasurement(
      product_id,
      product_measurement_unit_id,
      updateProductMeasurementRequest,
    );
    return new ActionResponse(product);
  }

  @Put('update-product-image/:product_id/:image_id')
  async updateProductImage(
    @Param('product_id') product_id: string,
    @Param('image_id') image_id: string,
  ) {
    const product = await this.productDashboardService.updateProductImage(
      product_id,
      image_id,
    );
    return new ActionResponse(product);
  }

  @Get('all-products-for-dashboard')
  async allProductsForDashboard(
    @Query() productsDashboardQuery: ProductsDashboardQuery,
  ) {
    const { limit, page } = productsDashboardQuery;

    const { products, total } =
      await this.productDashboardService.getAllProductsForDashboard(
        productsDashboardQuery,
      );
    const productsResponse = products.map((product) => {
      // const productResponse = plainToClass(ProductResponse, product);
      // console.log(JSON.stringify(product.product_sub_categories, null, '  '));

      const productResponse = new ProductsDashboardNewResponse(product);
      return productResponse;
    });
    const pageMetaDto = new PageMetaDto(page, limit, total);
    // const data = this._i18nResponse.entity(productsResponse);
    const pageDto = new PageDto(productsResponse, pageMetaDto);

    return new ActionResponse(pageDto);
  }

  @Get('all-products-offers-for-dashboard')
  async allProductsOffersForDashboard(
    @Query() productsDashboardQuery: ProductsDashboardQuery,
  ) {
    const { limit, page } = productsDashboardQuery;

    const { products, total } =
      await this.productDashboardService.getAllProductsOffersForDashboard(
        productsDashboardQuery,
      );
    const productsResponse = products.map((product) => {
      const productResponse = new ProductsOffersDashboardNewResponse(product);
      return productResponse;
    });
    const pageMetaDto = new PageMetaDto(page, limit, total);
    // const data = this._i18nResponse.entity(productsResponse);
    const pageDto = new PageDto(productsResponse, pageMetaDto);

    return new ActionResponse(pageDto);
  }

  @Get('single-product-offer-dashboard/:offer_id')
  async singleProductOfferDashboard(@Param('offer_id') offer_id: string) {
    const product =
      await this.productDashboardService.getSingleProductOfferDashboard(
        offer_id,
      );
    const productResponse = new ProductsOffersDashboardNewResponse(product);
    // console.log(JSON.stringify(product, null, '  '));
    //   const productResponse = plainToClass(ProductResponse, product);
    // const data = this._i18nResponse.entity(productsResponse);

    return new ActionResponse(productResponse);
  }

  @Get('single-product-dashboard')
  async singleProductDashboard(
    @Query() singleProductDashboardQuery: SingleProductDashboardQuery,
  ) {
    const product =
      await this.productDashboardService.getSingleProductForDashboard(
        singleProductDashboardQuery,
      );
    const productResponse = new SingleProductDashboardNewResponse(product);
    // console.log(JSON.stringify(product, null, '  '));
    //   const productResponse = plainToClass(ProductResponse, product);
    // const data = this._i18nResponse.entity(productsResponse);

    return new ActionResponse(productResponse);
  }
  @Get('most-selling')
  async getMostSelling(@Query('limit') limit: number) {
    return new ActionResponse(
      await this.productDashboardService.getMostSelling(limit),
    );
  }
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @Header(
    'Content-type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  @Get('selling-report')
  async getSellingReport(
    @Res() res: Response,
    @Query('start_date') start_date: Date,
    @Query('to_date') to_date: Date,
  ) {
    const File = await this.productDashboardService.getSellingStats(
      start_date,
      to_date,
    );
    res.download(`${File}`);
  }
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @Header(
    'Content-type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  @Get('daily-selling-report')
  async getDailySellingReport(@Res() res: Response, @Query('day') day: string) {
    const File = await this.productDashboardService.exportSellingReport(day);
    res.download(`${File}`);
  }

  @Delete('delete-Product/:product_id')
  async deleteProduct(@Param('product_id') id: string) {
    const product = await this.productDashboardService.deleteProduct(id);
    return new ActionResponse(product);
  }

  @Delete('delete-Product-image/:product_id/:image_id')
  async deleteProductImage(
    @Param('product_id') product_id: string,
    @Param('image_id') image_id: string,
  ) {
    const product = await this.productDashboardService.deleteProductImage(
      product_id,
      image_id,
    );
    return new ActionResponse(product);
  }
  @Delete('delete-Product-measurement/:product_id/:product_measurement_id')
  async deleteProductMeasurement(
    @Param('product_id') product_id: string,
    @Param('product_measurement_id') product_measurement_id: string,
  ) {
    const product = await this.productDashboardService.deleteProductMeasurement(
      product_id,
      product_measurement_id,
    );
    return new ActionResponse(product);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @Get('/export')
  @Header(
    'Content-type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  async exportProducts(@Res() res: Response) {
    const File = await this.productDashboardService.exportProducts();
    res.download(`${File}`);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @Get('unattched/export')
  @Header(
    'Content-type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  async exportunAttchedProducts(@Res() res: Response) {
    const File = await this.productDashboardService.exportunLiknedProducts();
    res.download(`${File}`);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @Get('attached/export')
  @Header(
    'Content-type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  async exportAttchedProducts(@Res() res: Response) {
    const File = await this.productDashboardService.exportLinkedProducts();
    res.download(`${File}`);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @Get('warehouse/export')
  @Header(
    'Content-type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  async exportWarehouseProducts(
    @Res() res: Response,
    @Query('warehouse_id') warehouse_id: string,
    @Query('quantity') quantity: number,
  ) {
    const File = await this.productDashboardService.exportWarehouseProducts(
      warehouse_id,
      quantity,
    );
    res.download(`${File}`);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @Get('warehouse-pricing/export')
  @Header(
    'Content-type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  async exportWarehouseProductsPricing(@Res() res: Response) {
    const File =
      await this.productDashboardService.exportWarehouseProductsPricing();
    res.download(`${File}`);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor, FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @Post('import')
  async importProducts(
    @Body() req: ImportCategoryRequest,
    @UploadedFile(new UploadValidator().build())
    file: Express.Multer.File,
  ) {
    req.file = file;
    const products = await this.productDashboardService.importProducts(req);
    return new ActionResponse(products);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor, FileInterceptor('logo'))
  @ApiConsumes('multipart/form-data')
  @Post('insert-brands')
  async insertBrand(
    @Body() req: CreateBrandRequest,
    @UploadedFile(new UploadValidator().build())
    logo: Express.Multer.File,
  ) {
    req.logo = logo;
    const products = await this.productDashboardService.CreateBrand(req);
    return new ActionResponse(products);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @UseInterceptors(ClassSerializerInterceptor, FileInterceptor('logo'))
  @ApiConsumes('multipart/form-data')
  @Put('update-brands')
  async updateBrand(
    @Body() req: CreateBrandRequest,
    @UploadedFile(new UploadValidator().build())
    logo: Express.Multer.File,
  ) {
    req.logo = logo;
    const products = await this.productDashboardService.CreateBrand(req);
    return new ActionResponse(products);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @Delete('delete-brands/:id')
  async deleteBrand(@Param('id') id: string) {
    const products = await this.brandService.delete(id);
    return new ActionResponse(products);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @Post('link-brand-proudct')
  async linkBrand(
    @Body() req: LinkBrandProuductRequest,
  ) {
    const products = await this.brandService.linkBrandToProduct(
     req
    );
    return new ActionResponse(products);
  }

 
  @Get('get-brands')
  async getBrands(@Query() query: PaginatedRequest) {
    const brands = await this.brandService.findAll(query);
    brands.map((brand) => {
      brand.logo = toUrl(brand.logo);
    });
    const total = await this.brandService.count(query);
    return new PaginatedResponse(brands, {
      meta: { total, page: query.page, limit: query.limit },
    });
  }
}
