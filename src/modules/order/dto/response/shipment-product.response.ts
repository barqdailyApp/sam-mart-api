import { Exclude, Expose, Transform, plainToClass } from 'class-transformer';
import { DeliveryType } from 'src/infrastructure/data/enums/delivery-type.enum';
import { PaymentMethod } from 'src/infrastructure/data/enums/payment-method';
import { ShipmentStatusEnum } from 'src/infrastructure/data/enums/shipment_status.enum';
import { User } from 'src/infrastructure/entities/user/user.entity';
import { AddressResponse } from 'src/modules/address/dto/responses/address.respone';
import { DriverResponse } from 'src/modules/driver/response/driver.response';
import { ProductCategoryPriceResponse } from 'src/modules/product/dto/response/product-category-price.response';
import { ProductResponse } from 'src/modules/product/dto/response/product.response';
import { SectionResponse } from 'src/modules/section/dto/response/section.response';
import { ProfileResponse } from 'src/modules/user/dto/responses/profile.response';
import { UserResponse } from 'src/modules/user/dto/responses/user.response';
import { WarehouseResponse } from 'src/modules/warehouse/dto/response/warehouse.response';

@Exclude()
export class ShipmentProductResponse {
  @Transform(({ value }) => plainToClass(ProductCategoryPriceResponse, value))
  @Expose()
  readonly product_category_price: ProductCategoryPriceResponse;

  @Expose() readonly product_id: string;

  @Expose() readonly section_id: string;

  @Expose() readonly id: string;

  @Expose() readonly shipment_id: string;

  @Expose() readonly quantity: number;

  @Expose() readonly main_measurement_id: string;

  @Expose() readonly conversion_factor: number;

  @Expose() readonly price: number;
}
