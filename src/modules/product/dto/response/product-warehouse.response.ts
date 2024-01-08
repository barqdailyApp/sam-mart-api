import { Exclude, Expose, Transform, plainToClass } from 'class-transformer';
import { toUrl } from 'src/core/helpers/file.helper';
import { MeasurementUnitResponse } from 'src/modules/measurement-unit/dto/responses/measurement-unit.response';

@Exclude()
export class ProductWarehouseResponse {
  @Expose() readonly id: string;

  @Expose() readonly warehouse_id: string;

  @Expose() readonly product_id: string;

  @Expose() readonly product_measurement_id: number;

  @Expose() readonly quantity: number;

  
}
