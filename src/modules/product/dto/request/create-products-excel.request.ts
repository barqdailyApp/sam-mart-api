import { IsArray, IsOptional, ValidateNested } from "class-validator";
import { CreateProductRequest } from "./create-product.request";
import { CreateProductImageRequest } from "./product-images/create-product-image.request";
import { Transform, Type } from "class-transformer";

export class CreateProductsExcelRequest {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateProductExcelRequest)
    products: CreateProductExcelRequest[];
}

export class CreateProductExcelRequest extends CreateProductRequest {
    @IsOptional()
    @Transform(({ value }) => JSON.parse(value))
    product_images: CreateProductImageRequest[];
}