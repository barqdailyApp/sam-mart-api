import { Expose, Transform, plainToInstance } from 'class-transformer';
import { toUrl } from 'src/core/helpers/file.helper';
import { MeasurementUnit } from 'src/infrastructure/entities/product/measurement-unit.entity';
import { ProductImage } from 'src/infrastructure/entities/product/product-image.entity';

export class WarehouseProductRespone {
  @Expose()
  id: string;
  @Expose()
  name_ar: string;
  @Expose()
  name_en: string;

  @Expose()
  description_ar: string;

  @Expose()
  description_en: string;

  @Expose()
  logo: string;

  @Expose()
  is_active: boolean;

  @Expose()
  quantity: number;

  @Expose()
  product_measurement_id: string;

 
  @Expose()
  barcode: string;
  @Expose()
  product_measurement: any;
  constructor(data: any) {
  
    this.id = data.product.id;
    this.name_ar = data.product.name_ar;
    this.name_en = data.product.name_en;
    this.is_active = data.product.is_active;
    this.barcode = data.product.barcode;
    this.description_ar = data.product.description_ar;
    this.description_en = data.product.description_en;
    this.logo = toUrl(data.product.product_images.find((e) => e.is_logo).url);
    this.quantity = data.quantity;
    this.product_measurement = {
      id: data.product_measurement.id,
      name_ar: data.product_measurement.measurement_unit.name_ar,
      name_en: data.product_measurement.measurement_unit.name_en,
    };
  }
}
