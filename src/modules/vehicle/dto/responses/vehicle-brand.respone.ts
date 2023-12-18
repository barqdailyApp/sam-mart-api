import { Expose } from "class-transformer";

export class VehicleBrandResponse {
    @Expose() id: string;
    @Expose() name: string;
    @Expose() logo: string;
}