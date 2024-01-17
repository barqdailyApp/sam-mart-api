import { Transform, Type } from "class-transformer";
import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Validate, ValidateNested } from "class-validator";
import { DeliveryType } from "src/infrastructure/data/enums/delivery-type.enum";
import { Role } from "src/infrastructure/data/enums/role.enum";
import { CreateCategoryExcelRequest } from "src/modules/category/dto/requests/create-categories-excel-request";

export class CreateSectionsExcelRequest {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateSectionExcelRequest)
    sections: CreateSectionExcelRequest[];
}

export class CreateSectionExcelRequest extends CreateCategoryExcelRequest {
    @IsNotEmpty()
    @IsNumber()
    @Transform(({ value }) => Number(value))
    order_by: number;

    @IsNotEmpty()
    @IsNumber()
    @Transform(({ value }) => Number(value))
    min_order_price: number;

    @IsNotEmpty()
    @IsNumber()
    @Transform(({ value }) => Number(value))
    delivery_price: number;

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    logo: string;

    @IsNotEmpty()
    @IsEnum(DeliveryType)
    delivery_type: DeliveryType;

    @IsNotEmpty()
    @Transform(({ value }) => JSON.parse(value))
    @IsEnum(Role, {
        each: true,
        message: 'Invalid role. Allowed values: ADMIN, CLIENT, RESTURANT, DRIVER',
    })
    allowed_roles: Role[];

    @IsNotEmpty()
    @IsBoolean()
    is_active: boolean;
}