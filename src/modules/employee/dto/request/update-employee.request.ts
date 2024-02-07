import { IsOptional } from "class-validator";
import { CreateEmployeeRequest } from "./create-employee.request";
import { Gender } from "src/infrastructure/data/enums/gender.enum";
import { EmployeeDepartement } from "src/infrastructure/data/enums/employee-department.enum";

export class UpdateEmployeeRequest extends CreateEmployeeRequest{
    @IsOptional()
    name_ar: string;

    @IsOptional()
    name_en: string;

    @IsOptional()
    email: string;

    @IsOptional()
    phone: string;

    @IsOptional()
    country_id: string;
    
    @IsOptional()
    city_id: string;

    @IsOptional()
    gender: Gender;

    @IsOptional()
    departements: EmployeeDepartement[];
}