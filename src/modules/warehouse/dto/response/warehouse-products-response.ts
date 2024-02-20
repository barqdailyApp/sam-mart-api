import { Expose, Transform } from 'class-transformer';
import { toUrl } from 'src/core/helpers/file.helper';

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
  @Transform(({ value }) => {
    return value.obj.product_images.find((e) => e.is_logo).url.map((e) => e.url=toUrl(e.url));
  })
  logo: string;

  @Expose()
  quantity: number;

  @Expose()
  product_measurement_id: string;

  @Expose()
  @Transform(({ value }) => {
    return {
      id: value.obj.main_measurement_id.unit.id,
      name: value.obj.main_measurement_id.unit.name,
    };
  })
  unit: any;
}
