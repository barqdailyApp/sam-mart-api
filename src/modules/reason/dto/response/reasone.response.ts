import { Expose } from "class-transformer";

export class ReasonResponse {
    @Expose() id: string;
    @Expose() name_en: string;
    @Expose() name_ar: string;
    @Expose() type: string;
}