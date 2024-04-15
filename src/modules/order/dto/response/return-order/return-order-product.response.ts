import { Expose, Transform, Type, plainToClass } from "class-transformer";
import { ShipmentProductResponse } from "../shipment-product.response";
import { ReasonResponse } from "src/modules/reason/dto/response/reasone.response";
import { ProductImagesResponse } from "src/modules/product/dto/response/product-images.response";
import { MeasurementUnitResponse } from "src/modules/measurement-unit/dto/responses/measurement-unit.response";

export class ReturnOrderProductResponse {
    @Expose() id: string;
    @Expose() shipment_product_id: string;
    @Expose() status: string;

    @Expose() @Transform(({ obj }) => obj.shipmentProduct?.product?.id) product_id: string;
    @Expose() @Transform(({ obj }) => obj.shipmentProduct?.product?.name_en) product_name_en: string;
    @Expose() @Transform(({ obj }) => obj.shipmentProduct?.product?.name_ar) product_name_ar: string;
    @Expose() @Transform(({ obj }) => obj.shipmentProduct?.product?.description_en) description_en: string;
    @Expose() @Transform(({ obj }) => obj.shipmentProduct?.product?.description_ar) description_ar: string;
    @Expose() quantity: number;
    @Expose() @Transform(({ obj }) => obj.shipmentProduct?.conversion_factor) conversion_factor: string;
    @Expose() @Transform(({ obj }) => obj.shipmentProduct?.price) price: string;

    @Transform(({ obj }) =>
        plainToClass(
            ProductImagesResponse,
            obj.shipmentProduct?.product?.product_images?.find(
                (image) => image.is_logo === true,
            ),
        ),
    )
    @Expose()
    readonly product_logo: ProductImagesResponse;

    @Transform(({ obj }) =>
        plainToClass(
            MeasurementUnitResponse,
            obj.shipmentProduct?.main_measurement_unit,
        ),
    )
    @Expose()
    readonly main_measurement_unit_en: MeasurementUnitResponse;

    @Expose() @Type(() => ReasonResponse) returnProductReason: ReasonResponse;

} 