import { Expose, plainToInstance, Transform, Type } from 'class-transformer';
import { toUrl } from 'src/core/helpers/file.helper';
import { MealOptionGroup } from 'src/infrastructure/entities/restaurant/meal/meal-option-group';
import { OptionGroup } from 'src/infrastructure/entities/restaurant/option/option-group.entity';

import { Option } from 'src/infrastructure/entities/restaurant/option/option.entity';
import { OptionGroupResponse } from './option-group.response';
import { OptionRespone } from './option.response';
import { Restaurant } from 'src/infrastructure/entities/restaurant/restaurant.entity';
import { RestaurantResponse } from './restaurant.response';
export class MealResponse {
  @Expose()
  id: string;
  @Expose()
  meal_id: string;
  @Expose()
  is_favorite: boolean;

  @Expose()
  name_ar: string;
  @Expose()
  name_en: string;

  @Expose()
  description: string;
  @Expose()
  quantity: number;
  @Expose()
  description_ar: string;
  @Expose()
  description_en: string;

  @Expose()
  order_by: number;
 

  @Expose()
  @Transform(({ obj }) => {
    if (!obj.offer || !obj.offer.is_active) {
      return null; // No active offer
    }

    // Convert current time to Yemen Time (UTC+3)
    const now = new Date();
    now.setUTCHours(now.getUTCHours() + 3); // Adjust to UTC+3 manually

    const startDate = new Date(obj.offer.start_date);
    const endDate = new Date(obj.offer.end_date);

    if (!(startDate <= now && endDate > now)) {
      return null; // Offer is not within the valid time range
    }
    obj.is_offer = true;
    const {
      discount_percentage,
      description,
      decscription_ar,
      decscription_en,
    } = obj.offer;
    const price = Number(obj.price)
      ? Number(obj.price) -
        (Number(discount_percentage) * Number(obj.price)) / 100
      : Number(obj.price);

    return {
      price,
      discount_percentage,
      description,
      decscription_ar,
      decscription_en,
    };
  })
  offer: any;

  @Expose()
  price: number;
  @Expose()
  total_price: number;

  @Expose()
  note: string;
  @Expose()
  @Type(() => RestaurantResponse)
  restaurant: RestaurantResponse;
  @Expose()
  @Transform(({ value }) => toUrl(value))
  image: string;
  @Expose()
  @Transform((value) => {
    if (
      value.obj.restaurant_category &&
      typeof value.obj.restaurant_category === 'object'
    ) {
      return {
        id: value.obj.restaurant_category.id,
        name_ar: value.obj.restaurant_category.name_ar,
        name_en: value.obj.restaurant_category.name_en,
        restaurant_id: value.obj.restaurant_category.restaurant_id,
      };
    }
    return null; // Handle cases where `value` is null or not an object
  })
  restaurant_category: any;

  @Expose()
  @Transform((value) => {
    return value.obj.meal_option_groups?.map((item: MealOptionGroup) =>
      plainToInstance(
        OptionGroupResponse,
        {
          ...item.option_group,
          id: item.id,
          options: item.meal_option_prices?.map((option) => {
            return {
              ...option.option,
              is_default: option.is_default,
              order_by: option.order_by,
              id: option.option_id,
              has_offer: value.obj.is_offer && item.apply_offer,
              price: Number(option.price),
              final_price: Number(
                value.obj.is_offer && item.apply_offer
                  ? option.price -
                      (value.obj.offer.discount_percentage * option.price) / 100
                  : option.price,
              ),
            };
          }),
          order_by: item.order_by,
          is_active: item.is_active,
          option_group_id: item.option_group_id,
        },
        { excludeExtraneousValues: true },
      ),
    );
  })
  option_groups: OptionGroupResponse[];

  @Expose()
  cart_quantity: number;

  @Expose()
  cart_total_price: number;

  @Expose()
  direct_add: boolean;

  @Expose()
  add_note: boolean;

  @Expose()
  is_active: boolean;

  @Expose()
  @Transform((value) => {
    return value.obj.options?.map((item) =>
      plainToInstance(
        OptionRespone,
        {
          ...item.option,

          option_id: item.option_id,

          id: item.option?.id || item.id,
          price: item.price,
        },
        { excludeExtraneousValues: true },
      ),
    );
  })
  options: OptionRespone[];
}

export class MealOfferResponse {
  @Expose()
  id: string;
  @Expose()
  meal_id: string;
  @Expose()
  description: string;
  @Expose()
  description_en: string;
  @Expose()
  description_ar: string;
  @Expose()
  order_by: number;

  @Expose()
  is_active: boolean;

  @Expose()
  start_date: Date;
  @Expose()
  end_date: Date;
  @Expose()
  discount_percentage: number;
  @Expose()
  @Type(() => MealResponse)
  meal: MealResponse;
  @Expose()
  @Type(() => RestaurantResponse)
  restaurant: RestaurantResponse;
}
