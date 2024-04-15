import { Exclude, Expose, Transform, Type, plainToClass } from 'class-transformer';
import { DeliveryType } from 'src/infrastructure/data/enums/delivery-type.enum';
import { PaymentMethodEnum } from 'src/infrastructure/data/enums/payment-method';
import { ShipmentStatusEnum } from 'src/infrastructure/data/enums/shipment_status.enum';
import { User } from 'src/infrastructure/entities/user/user.entity';
import { AddressResponse } from 'src/modules/address/dto/responses/address.respone';
import { DriverResponse } from 'src/modules/driver/response/driver.response';
import { MeasurementUnitResponse } from 'src/modules/measurement-unit/dto/responses/measurement-unit.response';
import { ProductCategoryPriceResponse } from 'src/modules/product/dto/response/product-category-price.response';
import { ProductImagesResponse } from 'src/modules/product/dto/response/product-images.response';
import { ProductResponse } from 'src/modules/product/dto/response/product.response';
import { SectionResponse } from 'src/modules/section/dto/response/section.response';
import { ProfileResponse } from 'src/modules/user/dto/responses/profile.response';
import { UserResponse } from 'src/modules/user/dto/responses/user.response';
import { WarehouseResponse } from 'src/modules/warehouse/dto/response/warehouse.response';

@Exclude()
export class ShipmentProductResponse {
  @Expose() readonly id: string;

  @Expose() readonly product_id: string;
  @Expose() @Type(() => ProductResponse) product: ProductResponse;

  @Transform(({ obj }) =>
    plainToClass(
      ProductImagesResponse,
      obj.product_category_price?.product_sub_category.product.product_images.find(
        (image) => image.is_logo === true,
      ),
    ),
  )
  @Expose()
  readonly product_logo: ProductImagesResponse;

  @Transform(({ obj }) =>
    plainToClass(
      ProductImagesResponse,
      obj.product_category_price?.product_sub_category.product.name_ar,
    ),
  )
  @Expose()
  readonly product_name_ar: string;

  @Transform(({ obj }) =>
    plainToClass(
      ProductImagesResponse,
      obj.product_category_price?.product_sub_category?.product.name_en,
    ),
  )
  @Expose()
  readonly product_name_en: string;

  @Transform(({ obj }) =>
    plainToClass(
      ProductImagesResponse,
      obj.product_category_price?.product_sub_category?.product.description_ar,
    ),
  )
  @Expose()
  readonly product_description_ar: string;

  @Transform(({ obj }) =>
    plainToClass(
      ProductImagesResponse,
      obj.product_category_price?.product_sub_category?.product.description_en,
    ),
  )
  @Expose()
  readonly product_description_en: string;
  @Expose() readonly price: number;
  @Expose() readonly quantity: number;
  @Expose() readonly conversion_factor: number;

  @Transform(({ obj }) =>
    plainToClass(
      MeasurementUnitResponse,
      obj.product_category_price?.product_measurement?.measurement_unit,
    ),
  )
  @Expose()
  readonly measurement_unit: MeasurementUnitResponse;

  @Expose() readonly section_id: string;

  @Expose() readonly shipment_id: string;

  @Expose() readonly main_measurement_id: string;
}
