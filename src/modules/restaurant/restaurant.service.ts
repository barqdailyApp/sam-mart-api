import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/core/base/service/service.base';
import { Restaurant } from 'src/infrastructure/entities/restaurant/restaurant.entity';
import { Repository } from 'typeorm';
import { GetNearResturantsQuery } from './dto/requests/get-near-resturants.query';
import { plainToInstance } from 'class-transformer';
import { RestaurantResponse } from './dto/responses/restaurant.response';
import { CuisineResponse } from './dto/responses/cuisine.response';
import { Meal } from 'src/infrastructure/entities/restaurant/meal.entity';

@Injectable()
export class RestaurantService extends BaseService<Restaurant> {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,

    @InjectRepository(Meal)
    private readonly mealRepository: Repository<Meal>,
  ) {
    super(restaurantRepository);
  }

  async findAllNearRestaurants(query: GetNearResturantsQuery) {
    const restaurants = await this.restaurantRepository
      .createQueryBuilder('restaurant')
      .leftJoinAndSelect('restaurant.cuisine_types', 'cuisine')
      .addSelect(
        `
        (6371 * acos(
          cos(radians(:latitude)) * 
          cos(radians(restaurant.latitude)) * 
          cos(radians(restaurant.longitude) - radians(:longitude)) + 
          sin(radians(:latitude)) * 
          sin(radians(restaurant.latitude))
        ))`,
        'distance',
      )
      .where('restaurant.is_active = :is_active', { is_active: true })
      .andWhere('cuisine.is_active = :is_active', { is_active: true })
      .having('distance <= :radius', { radius: query.radius })
      .setParameters({ latitude: query.latitude, longitude: query.longitude })
      .orderBy('distance', 'ASC')
      .getRawAndEntities(); // This will return both raw fields and entity objects
  
    // `getRawAndEntities()` returns { raw: [], entities: [] }
    const { raw, entities } = restaurants;
  
    // Map the distance from raw data into the restaurant entities
    const restaurantsWithDistance = entities.map((restaurant, index) => {
      const distance = raw[index]?.distance; // Get the corresponding distance value
      return {
        ...restaurant,
        distance: parseFloat(distance), // Ensure distance is a number
      };
    });
  
    // Extract unique cuisine types
    const cuisines = new Set();
    restaurantsWithDistance.forEach((restaurant) => {
      restaurant.cuisine_types.forEach((cuisine) =>
        cuisines.add(JSON.stringify(cuisine)),
      );
    });
  
    // Return both restaurants with distance and unique cuisines
    return {
      restaurants: plainToInstance(RestaurantResponse, restaurantsWithDistance, {
        excludeExtraneousValues: true,
      }),
      cuisines: plainToInstance(CuisineResponse, Array.from(cuisines).map((cuisine) =>
        JSON.parse(cuisine as string),
      )),
      sorting:[{type:"top",keys:[{average_rating:"desc"}],},{type:"popular",keys:[{No_of_reviews:"desc"},{average_rating:"desc"}],}]

    };
  }


  async getTopSellerMeals(query: GetNearResturantsQuery) {
    const { latitude, longitude, radius } = query;
  
    const meals = await this.mealRepository
      .createQueryBuilder('meal')
      .leftJoinAndSelect('meal.restaurant_category', 'category')
      .leftJoinAndSelect('category.restaurant', 'restaurant')
      .where('restaurant.is_active = :is_active', { is_active: true })
      .andWhere('category.is_active = :is_active', { is_active: true })
      .andWhere('meal.is_active = :is_active', { is_active: true })
      .andWhere(
        `(6371 * acos(
          cos(radians(:latitude)) * cos(radians(restaurant.latitude)) *
          cos(radians(restaurant.longitude) - radians(:longitude)) +
          sin(radians(:latitude)) * sin(radians(restaurant.latitude))
        )) <= :radius`,
        { latitude, longitude, radius }
      )
      .orderBy('meal.sales_count', 'DESC')
      .limit(50) // Example ordering by top sales
      .getMany();
  
    return meals;
  }
  
  
}
