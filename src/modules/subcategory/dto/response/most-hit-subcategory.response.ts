import { Expose, Transform, Type } from "class-transformer";
import { toUrl } from "src/core/helpers/file.helper";

class SubcategoryResponse {
    @Expose() id: string;
    @Expose() name_ar: string;
    @Expose() name_en: string;
    @Expose() @Transform(({ value }) => toUrl(value)) logo: string;
}

class SectionCategoryResponse {
    @Expose() is_active: boolean;

    @Type(() => SubcategoryResponse)
    @Expose() subcategory: SubcategoryResponse;
}

export class MostHitSubCategoryResponse {
    @Expose() category_sub_category_id: string;
    @Expose() current_hit: number;
    @Expose() previous_hit: number;

    @Type(() => SectionCategoryResponse)
    @Expose() categorySubCategory: SectionCategoryResponse;
}

export class MostHitSubcategoryReponseWithInfo{
    @Type(() => MostHitSubCategoryResponse)
    @Expose() mostHitSubCategories: MostHitSubCategoryResponse[];

    @Expose() total_count: number;
}


