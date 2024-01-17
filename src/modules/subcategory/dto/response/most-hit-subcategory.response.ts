import { Expose, Type } from "class-transformer";

class SubcategoryResponse {
    @Expose() id: string;
    @Expose() name_ar: string;
    @Expose() name_en: string;
    @Expose() logo: string;
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


