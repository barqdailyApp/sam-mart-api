import { Expose, Transform } from 'class-transformer';

export class FlattenedData {
    @Expose()
    id: number;

    @Expose({ name: 'name_ar' })
    nameAr: string;

    @Expose({ name: 'name_en' })
    nameEn: string;

    @Expose()
    logo: string;

    @Expose({ name: 'is_active_category' })
    isActiveCategory: boolean;

    @Expose()
    @Transform(({ value }) => ({
        id: value.section?.id,
        name_ar: value.section?.name_ar,
        name_en: value.section?.name_en,
        logo: value.section?.logo,
    }))
    section: {
        id: number;
        name_ar: string;
        name_en: string;
        logo: string;
    };

    @Expose()
    @Transform(({value}) => ({
        id: value.subcategory?.id,
        is_active_subCategory: value.is_active_subCategory,
        name_ar: value.subcategory?.name_ar,
        name_en: value.subcategory?.name_en,
        logo: value.subcategory?.logo,
    }))
    subcategory: {
        id: number;
        is_active_subCategory: boolean;
        name_ar: string;
        name_en: string;
        logo: string;
    };

    constructor(data: Partial<FlattenedData>) {
        Object.assign(this, data);
    }
}