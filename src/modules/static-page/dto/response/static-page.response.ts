import { Expose } from "class-transformer";
import { StaticPagesEnum } from "src/infrastructure/data/enums/static-pages.enum";

export class StaticPageResponse {
    @Expose() id: string;
    @Expose() static_page_type: StaticPagesEnum;
    @Expose() content: string;
    @Expose() created_at: Date;
    @Expose() updated_at: Date;

}