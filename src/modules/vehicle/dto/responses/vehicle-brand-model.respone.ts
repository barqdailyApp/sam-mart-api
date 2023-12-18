import { Expose } from "class-transformer";

export class VehicleBrandModelResponse {
    @Expose() id: string;
    @Expose() name: string;
}