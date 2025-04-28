import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  Res,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/core/base/service/service.base';
import { Restaurant } from 'src/infrastructure/entities/restaurant/restaurant.entity';
import { DeleteResult, In, Repository } from 'typeorm';
import {
  GetNearResturantsQuery,
  GetNearResturantsQuerySearch,
} from './dto/requests/get-near-resturants.query';
import { plainToInstance } from 'class-transformer';
import { RestaurantResponse } from './dto/responses/restaurant.response';
import { CuisineResponse } from './dto/responses/cuisine.response';
import { Meal } from 'src/infrastructure/entities/restaurant/meal/meal.entity';
import { and, json, where } from 'sequelize';
import { RestaurantStatus } from 'src/infrastructure/data/enums/restaurant-status.enum';
import { RegisterRestaurantRequest } from './dto/requests/register-restaurant.request';
import { RegisterRestaurantTransaction } from './util/register-restaurant.transaction';
import { CuisineType } from 'src/infrastructure/entities/restaurant/cuisine-type.entity';
import {
  AddRestaurantCategoryRequest,
  UpdateRestaurantCategoryRequest,
} from './dto/requests/add-restaurant-category.request';
import { RestaurantCategory } from 'src/infrastructure/entities/restaurant/restaurant-category.entity';
import {
  AddMealRequest,
  UpdateMealRequest,
} from './dto/requests/add-meal.request';
import * as fs from 'fs';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { RestaurantCartMeal } from 'src/infrastructure/entities/restaurant/cart/restaurant-cart-meal.entity';
import { MealResponse } from './dto/responses/meal.response';
import { AddCuisineRequest } from './dto/requests/add-cuisine.request';
import { OptionGroup } from 'src/infrastructure/entities/restaurant/option/option-group.entity';
import {
  AddOptionGroupRequest,
  CreateOptionRequest,
  UpdateOptionGroupRequest,
  UpdateOptionRequest,
} from './dto/requests/add-option-group.request';
import { Option } from 'src/infrastructure/entities/restaurant/option/option.entity';
import { AddMealOptionGroupsRequest } from './dto/requests/add-meal-option-groups.request';
import { MealOptionGroup } from 'src/infrastructure/entities/restaurant/meal/meal-option-group';
import { UpdateRestaurantRequest } from './dto/requests/update-restaurant.request';
import { UpdateCuisineRequest } from './dto/requests/update-cusisine.request';
import { Constant } from 'src/infrastructure/entities/constant/constant.entity';
import { ConstantType } from 'src/infrastructure/data/enums/constant-type.enum';
import { MealOffer } from 'src/infrastructure/entities/restaurant/meal/meal-offer.entity';
import {
  MakeMealOfferRequest,
  UpdateMealOfferRequest,
} from './dto/requests/make-meal-offer.request';
import { RestaurantGroup } from 'src/infrastructure/entities/restaurant/restaurant-group.entity';
import { ClientFavoriteMeal } from 'src/infrastructure/entities/restaurant/meal/client-favorite-meal.entity';
import { RestaurantSchedule } from 'src/infrastructure/entities/restaurant/order/restaurant_schedule.entity';
import { addRestaurantSchedule } from './dto/requests/add-restaurant-schedule.request';
import { updateRestaurantScheduleRequest } from './dto/requests/update-restaurant.schedule.request';

@Injectable()
export class RestaurantService extends BaseService<Restaurant> {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
    @InjectRepository(CuisineType)
    private readonly cuisineTypeRepository: Repository<CuisineType>,
    @InjectRepository(RestaurantCategory)
    private readonly restaurantCategoryRepository: Repository<RestaurantCategory>,
    @InjectRepository(RestaurantCartMeal)
    private readonly cartMealRepository: Repository<RestaurantCartMeal>,
    @InjectRepository(Meal)
    private readonly mealRepository: Repository<Meal>,
    private readonly registerRestaurantTransaction: RegisterRestaurantTransaction,
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(OptionGroup)
    private readonly optionGroupRepository: Repository<OptionGroup>,
    @InjectRepository(Option)
    private readonly optionRepository: Repository<Option>,
    @InjectRepository(MealOptionGroup)
    private readonly mealOptionGroupRepository: Repository<MealOptionGroup>,
    @InjectRepository(Constant)
    private readonly constantRepository: Repository<Constant>,
    @InjectRepository(MealOffer)
    private readonly mealOfferRepository: Repository<MealOffer>,
    @InjectRepository(RestaurantGroup)
    private readonly restaurantGroupRepository: Repository<RestaurantGroup>,
    @InjectRepository(ClientFavoriteMeal)
    private readonly clientFavoriteMealRepository: Repository<ClientFavoriteMeal>,
    @InjectRepository(RestaurantSchedule)
    private readonly restaurantScheduleRepository: Repository<RestaurantSchedule>,
  ) {
    super(restaurantRepository);
  }

  async findAllNearRestaurantsCusine(query: GetNearResturantsQuery) {
    const deliveryTimePerKm =
      (await this.constantRepository.findOne({
        where: { type: ConstantType.DELIVERY_TIME_PER_KM },
      })) ?? 0;
    const restaurants = await this.restaurantRepository
      .createQueryBuilder('restaurant')
      .leftJoinAndSelect('restaurant.cuisine_types', 'cuisine')
      .leftJoinAndSelect('restaurant.schedules', 'schedule')
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
      .where('restaurant.status = :status', { status: RestaurantStatus.ACTIVE }) // Assuming 'ACTIVE' is the status you want to filter on', { is_active: true })
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
        is_open: this.IsRestaurantOpen(restaurant.id, restaurant.schedules),
        distance: parseFloat(distance), // Ensure distance is a number
        estimated_delivery_time:
          Number(restaurant.average_prep_time) +
          Number(deliveryTimePerKm) * distance,
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
      restaurants: plainToInstance(
        RestaurantResponse,
        restaurantsWithDistance,
        {
          excludeExtraneousValues: true,
        },
      ),
      cuisines: plainToInstance(
        CuisineResponse,
        Array.from(cuisines).map((cuisine) => JSON.parse(cuisine as string)),
      ),
      sorting: [
        { type: 'top', keys: [{ average_rating: 'desc' }] },
        {
          type: 'popular',
          keys: [{ no_of_reviews: 'desc' }, { average_rating: 'desc' }],
        },
      ],
    };
  }

  async findAllNearRestaurantsCusineMeals(query: GetNearResturantsQuerySearch) {
    const deliveryTimePerKm =
      (await this.constantRepository.findOne({
        where: { type: ConstantType.DELIVERY_TIME_PER_KM },
      })) ?? 0;

    const restaurantQuery = this.restaurantRepository
      .createQueryBuilder('restaurant')
      .leftJoinAndSelect('restaurant.cuisine_types', 'cuisine')
      .leftJoinAndSelect('restaurant.categories', 'category')
      .leftJoinAndSelect('restaurant.schedules', 'schedule')
      .leftJoinAndSelect('category.meals', 'meal')
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
      .where('restaurant.status = :status', { status: RestaurantStatus.ACTIVE })
      .andWhere('cuisine.is_active = :is_active', { is_active: true })
      .having('distance <= :radius', { radius: query.radius })
      .setParameters({ latitude: query.latitude, longitude: query.longitude });

    if (query.is_restaurant) {
      // Search restaurants by name
      restaurantQuery.andWhere(
        '(restaurant.name_en LIKE :name OR restaurant.name_ar LIKE :name)',
        {
          name: `%${query.name}%`,
        },
      );

      // Order meals by default sorting
      restaurantQuery.addOrderBy('meal.sales_count', 'DESC'); // You can change the order criteria if needed
    } else {
      // Search meals by name
      restaurantQuery.andWhere(
        '(meal.name_en LIKE :name OR meal.name_ar LIKE :name)',
        {
          name: `%${query.name}%`,
        },
      );

      // Prioritize the most relevant meals based on similarity
      restaurantQuery.addOrderBy(
        `CASE 
                WHEN meal.name_en = :name OR meal.name_ar = :name THEN 1 
                WHEN meal.name_en LIKE :exactMatch OR meal.name_ar LIKE :exactMatch THEN 2 
                ELSE 3 
            END`,
        'ASC',
      );
    }

    restaurantQuery.setParameters({
      name: `%${query.name}%`,
      exactMatch: `${query.name}%`,
    });

    const { raw, entities } = await restaurantQuery.getRawAndEntities();

    // Modify response
    const modifiedRestaurants = entities.map((restaurant) => ({
      ...restaurant,
      is_open: this.IsRestaurantOpen(restaurant.id, restaurant.schedules),
      distance: parseFloat(raw[entities.indexOf(restaurant)]?.distance), // Ensure distance is a number
      estimated_delivery_time:
        Number(restaurant.average_prep_time) +
        Number(deliveryTimePerKm) *
          parseFloat(raw[entities.indexOf(restaurant)]?.distance),
      categories: undefined, // Remove categories
      meals: restaurant.categories.flatMap((category) => category.meals), // Extract meals
    }));

    return modifiedRestaurants;
  }

  async findAllNearRestaurantsGroup(query: GetNearResturantsQuery) {
    const deliveryTimePerKm =
      (await this.constantRepository.findOne({
        where: { type: ConstantType.DELIVERY_TIME_PER_KM },
      })) ?? 0;

    const groups = await this.restaurantGroupRepository
      .createQueryBuilder('restaurant-group')
      .leftJoinAndSelect('restaurant-group.restaurants', 'restaurant')
      .leftJoinAndSelect('restaurant.schedules', 'schedule')
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
      .where('restaurant.status = :status', { status: RestaurantStatus.ACTIVE })
      .andWhere('restaurant-group.is_active = :is_active', { is_active: true })
      .having('distance <= :radius', { radius: query.radius })
      .setParameters({ latitude: query.latitude, longitude: query.longitude })
      .orderBy('distance', 'ASC')
      .getRawAndEntities();

    const { raw, entities } = groups;

    const result = entities.map((group) => {
      const response = plainToInstance(CuisineResponse, group, {
        excludeExtraneousValues: true,
      });

      response.restaurants = response.restaurants.map((restaurant, index) => {
        restaurant.is_open = this.IsRestaurantOpen(
          restaurant.id,
          restaurant.schedules,
        );
        restaurant.distance = parseFloat(raw[index]?.distance || '0');
        restaurant.estimated_delivery_time = restaurant.average_prep_time;
        Number(deliveryTimePerKm) * restaurant.distance;
        return restaurant;
      });

      return response;
    });

    return result;
  }

  async getTopSellerMeals(query: GetNearResturantsQuery) {
    const { latitude, longitude, radius } = query;

    const meals = await this.mealRepository
      .createQueryBuilder('meal')
      .leftJoinAndSelect('meal.restaurant_category', 'category')
      .leftJoinAndSelect('category.restaurant', 'restaurant')
      .leftJoinAndSelect('meal.offer', 'offer')
      .where('restaurant.status = :status', { status: RestaurantStatus.ACTIVE })
      .andWhere('category.is_active = :is_active', { is_active: true })
      .andWhere('meal.is_active = :is_active', { is_active: true })
      .andWhere(
        `(6371 * acos(
          cos(radians(:latitude)) * cos(radians(restaurant.latitude)) *
          cos(radians(restaurant.longitude) - radians(:longitude)) +
          sin(radians(:latitude)) * sin(radians(restaurant.latitude))
        )) <= :radius`,
        { latitude, longitude, radius },
      )
      .orderBy('meal.sales_count', 'DESC')
      .limit(50) // Example ordering by top sales
      .getMany();

    return meals;
  }

  async getSingleRestaurant(id: string, user_id?: string) {
    const restaurant = await this._repo.findOne({
      where: { id },
      relations: {
        schedules: true,
        categories: {
          meals: { meal_option_groups: { option_group: true }, offer: true },
        },
        cuisine_types: true,
      },
      order: { schedules: { order_by: 'ASC' } },
    });

    if (!restaurant) throw new NotFoundException('no resturant found');
    const response = plainToInstance(
      RestaurantResponse,
      {
        ...restaurant,
        is_open: await this.IsRestaurantOpen(id, restaurant.schedules),
      },
      {
        excludeExtraneousValues: true,
      },
    );
    await Promise.all(
      response.categories.map(async (category) => {
        await Promise.all(
          category.meals.map(async (meal) => {
            meal.direct_add = true;

            if (user_id) {
              const favorite_meal =
                await this.clientFavoriteMealRepository.findOne({
                  where: { user_id: user_id, meal_id: meal.id },
                });
              meal.is_favorite = !!favorite_meal;
            }

            // If option group min_selection > 0
            if (meal.option_groups?.length > 0) {
              meal.direct_add = false;
            }
          }),
        );
      }),
    );

    let cart_details = null;
    if (user_id) {
      const cart_meals = await this.cartMealRepository.find({
        where: { cart: { user_id: user_id } },
        relations: {
          meal: { offer: true },
          cart_meal_options: { option: true },
          cart: true,
        },
      });

      const total_price = cart_meals.reduce(
        (acc, curr) =>
          acc +
          (curr.quantity * curr.meal.price +
            curr.cart_meal_options.reduce(
              (acc, curr) => acc + curr.option.price,
              0,
            )),
        0,
      );
      const meals_count = cart_meals?.length;
      cart_details = {
        meals_count,
        total_price,
        restaurant_id: cart_meals[0]?.cart?.restaurant_id,
      };
    }
    return {
      restaurant: response,
      cart: restaurant.id == cart_details?.restaurant_id ? cart_details : null,
    };
  }

  async getAdminSingleRestaurant(id: string) {
    const restaurant = await this._repo.findOne({
      where: { id },
      relations: {
        categories: { meals: { meal_option_groups: { option_group: true } } },
        cuisine_types: true,
        groups: true,
        admins: { user: true },
        attachments: true,
        schedules: true,
      },
    });
    return restaurant;
  }

  async getSingleMeal(id: string, user_id?: string) {
    const meal = await this.mealRepository.findOne({
      where: { id },
      relations: {
        meal_option_groups: { option_group: { options: true } },
        offer: true,
      },
    });
    if (!meal) throw new NotFoundException('no meal found');

    const meal_response = plainToInstance(MealResponse, meal, {
      excludeExtraneousValues: true,
    });
    if (user_id) {
      const favorite_meal = await this.clientFavoriteMealRepository.findOne({
        where: { user_id: user_id, meal_id: meal.id },
      });
      meal_response.is_favorite = !!favorite_meal;
    }

    return meal_response;
  }

  async register(req: RegisterRestaurantRequest) {
    const restaurant = await this.registerRestaurantTransaction.run(req);
    return restaurant;
  }

  async acceptRestaurant(id: string) {
    const restaurant = await this._repo.findOne({
      where: { id, status: RestaurantStatus.PENDING },
    });
    if (!restaurant) throw new NotFoundException('no resturant found');
    restaurant.status = RestaurantStatus.ACTIVE;
    return await this._repo.save(restaurant);
  }

  async getCuisineTypes() {
    return await this.cuisineTypeRepository.find({
      order: { order_by: 'ASC' },
    });
  }

  async getRestaurantGroups() {
    return await this.restaurantGroupRepository.find({
      where: { is_active: true },
      order: { order_by: 'ASC' },
    });
  }

  async getAdminRestaurantGroups() {
    return await this.restaurantGroupRepository.find({
      order: { order_by: 'ASC' },
    });
  }

  async addRestaurantCategory(
    req: AddRestaurantCategoryRequest,
    restaurant_id: string,
  ) {
    const restaurant_category = plainToInstance(RestaurantCategory, {
      ...req,
      restaurant_id: restaurant_id,
    });
    return await this.restaurantCategoryRepository.save(restaurant_category);
  }

  async editRestaurantCategory(
    req: UpdateRestaurantCategoryRequest,
    restaurant_id: string,
  ) {
    const restaurant_category = await this.restaurantCategoryRepository.findOne(
      { where: { id: req.id, restaurant_id: restaurant_id } },
    );
    if (!restaurant_category) throw new NotFoundException('no category found');
    restaurant_category.name_ar = req.name_ar;
    restaurant_category.name_en = req.name_en;
    restaurant_category.order_by = req.order_by;
    restaurant_category.is_active = req.is_active;
    return await this.restaurantCategoryRepository.save(restaurant_category);
  }
  async deleteCategory(id: string, restaurant_id: string) {
    const category = await this.restaurantCategoryRepository.findOne({
      where: { id: id, restaurant_id: restaurant_id },
    });
    if (!category) throw new NotFoundException('no category found');
    return await this.restaurantCategoryRepository.softRemove(category);
  }

  async addMeal(req: AddMealRequest, restaurant_id: string) {
    const meal = plainToInstance(Meal, {
      ...req,
      restaurant_id: restaurant_id,
    });
    //check if directory exist
    if (!fs.existsSync('storage/restaurant-meals/'))
      fs.mkdirSync('storage/restaurant-meals/');
    if (fs.existsSync(req.image))
      fs.renameSync(
        req.image,
        req.image.replace('/tmp/', '/restaurant-meals/'),
      );
    meal.image = req.image.replace('/tmp/', '/restaurant-meals/');
    return await this.mealRepository.save(meal);
  }

  async addCuisine(req: AddCuisineRequest) {
    const cuisine = plainToInstance(CuisineType, { ...req });
    //check if directory exist
    if (!fs.existsSync('storage/cuisine-types/'))
      fs.mkdirSync('storage/cuisine-types/');
    if (fs.existsSync(req.logo))
      fs.renameSync(req.logo, req.logo.replace('/tmp/', '/cuisine-types/'));
    cuisine.logo = req.logo.replace('/tmp/', '/cuisine-types/');
    await this.cuisineTypeRepository.save(cuisine);
    return plainToInstance(CuisineResponse, cuisine, {
      excludeExtraneousValues: true,
    });
  }

  async addRestauntGroup(req: AddCuisineRequest) {
    const group = plainToInstance(CuisineType, { ...req });
    //check if directory exist
    if (!fs.existsSync('storage/restaurant-groups/'))
      fs.mkdirSync('storage/restaurant-groups/');
    if (fs.existsSync(req.logo))
      fs.renameSync(req.logo, req.logo.replace('/tmp/', '/restaurant-groups/'));
    group.logo = req.logo.replace('/tmp/', '/restaurant-groups/');
    await this.restaurantGroupRepository.save(group);
    return plainToInstance(CuisineResponse, group, {
      excludeExtraneousValues: true,
    });
  }

  async addGroupToRestaurant(group_id: string, restaurant_id: string) {
    const group = await this.restaurantGroupRepository.findOne({
      where: { id: group_id },
    });
    if (!group) throw new NotFoundException('no group found');
    const restaurant = await this._repo.findOne({
      where: { id: restaurant_id },
      relations: { groups: true },
    });
    if (!restaurant) throw new NotFoundException('no restaurant found');
    restaurant.groups.push(group);
    return await this._repo.save(restaurant);
  }

  async unlinkGroupFromRestaurant(group_id: string, restaurant_id: string) {
    const group = await this.restaurantGroupRepository.findOne({
      where: { id: group_id },
    });
    if (!group) throw new NotFoundException('no group found');
    const restaurant = await this._repo.findOne({
      where: { id: restaurant_id },
      relations: { groups: true },
    });
    if (!restaurant) throw new NotFoundException('no restaurant found');
    restaurant.groups = restaurant.groups.filter((g) => g.id !== group_id);
    return await this._repo.save(restaurant);
  }
  async getSingleCuisine(id: string) {
    const cuisine = await this.cuisineTypeRepository.findOne({
      where: { id: id },
    });

    return plainToInstance(CuisineResponse, cuisine, {
      excludeExtraneousValues: true,
    });
  }

  async getSingleRestantGroup(id: string) {
    const group = await this.restaurantGroupRepository.findOne({
      where: { id: id },
    });
    return plainToInstance(CuisineResponse, group, {
      excludeExtraneousValues: true,
    });
  }
  async updateCuisine(req: UpdateCuisineRequest) {
    const cuisine = await this.cuisineTypeRepository.findOne({
      where: { id: req.id },
    });
    if (!cuisine) throw new NotFoundException('no cuisine found');
    cuisine.name_ar = req.name_ar;
    cuisine.name_en = req.name_en;
    if (req.logo) {
      //delete old image
      if (cuisine.logo && fs.existsSync(cuisine.logo))
        fs.unlinkSync(cuisine.logo);
      //check if directory exist
      if (fs.existsSync(req.logo))
        fs.renameSync(req.logo, req.logo.replace('/tmp/', '/cuisine-types/'));
      cuisine.logo = req.logo.replace('/tmp/', '/cuisine-types/');
    }
    cuisine.is_active = req.is_active;
    cuisine.order_by = req.order_by;
    await this.cuisineTypeRepository.save(cuisine);
    return plainToInstance(CuisineResponse, cuisine, {
      excludeExtraneousValues: true,
    });
  }

  async updateRestauntGroup(req: UpdateCuisineRequest) {
    const group = await this.restaurantGroupRepository.findOne({
      where: { id: req.id },
    });
    if (!group) throw new NotFoundException('no group found');
    group.name_ar = req.name_ar;
    group.name_en = req.name_en;
    if (req.logo) {
      //delete old image
      if (group.logo && fs.existsSync(group.logo)) fs.unlinkSync(group.logo);
      //check if directory exist
      if (fs.existsSync(req.logo))
        fs.renameSync(
          req.logo,
          req.logo.replace('/tmp/', '/restaurant-groups/'),
        );
      group.logo = req.logo.replace('/tmp/', '/restaurant-groups/');
    }
    group.is_active = req.is_active;
    group.order_by = req.order_by;
    await this.restaurantGroupRepository.save(group);
    return plainToInstance(CuisineResponse, group, {
      excludeExtraneousValues: true,
    });
  }
  async deleteCuisine(id: string) {
    const cuisine = await this.cuisineTypeRepository.findOne({
      where: { id: id },
    });
    if (!cuisine) throw new NotFoundException('no cuisine found');
    return await this.cuisineTypeRepository.softRemove(cuisine);
  }

  async deleteRestauntGroup(id: string) {
    const group = await this.restaurantGroupRepository.findOne({
      where: { id: id },
    });
    if (!group) throw new NotFoundException('no group found');
    return await this.restaurantGroupRepository.softRemove(group);
  }

  async getRestaurantCategories(restaurant_id: string) {
    return await this.restaurantCategoryRepository.find({
      where: { restaurant_id: restaurant_id },
    });
  }

  async getRestaurantCategoryMeals(restaurant_id: string, category_id: string) {
    return await this.restaurantCategoryRepository.findOne({
      where: { restaurant_id: restaurant_id, id: category_id },
      relations: {
        meals: {
          meal_option_groups: { option_group: { options: true } },
          offer: true,
        },
      },
    });
  }
  // edit meal

  async editMeal(req: UpdateMealRequest, restaurant_id: string) {
    const meal = await this.mealRepository.findOne({
      where: {
        id: req.id,
        restaurant_category: { restaurant_id: restaurant_id },
      },
    });
    if (!meal) throw new NotFoundException('no meal found');
    if (req.image) {
      //delete old image
      if (meal.image && fs.existsSync(meal.image)) fs.unlinkSync(meal.image);
      //check if directory exist
      if (fs.existsSync(req.image))
        fs.renameSync(
          req.image,
          req.image.replace('/tmp/', '/restaurant-meals/'),
        );
      meal.image = req.image.replace('/tmp/', '/restaurant-meals/');
    }
    meal.name_ar = req.name_ar;
    meal.name_en = req.name_en;
    meal.description_ar = req.description_ar;
    meal.description_en = req.description_en;
    meal.price = req.price;
    meal.is_active = req.is_active;

    return await this.mealRepository.save(meal);
  }

  // delete meal
  async deleteMeal(id: string, restaurant_id: string) {
    const meal = await this.mealRepository.findOne({
      where: { id: id, restaurant_category: { restaurant_id: restaurant_id } },
    });
    if (!meal) throw new NotFoundException('no meal found');
    return await this.mealRepository.softRemove(meal);
  }

  async getRestaurantOptionGroups(restaurant_id: string) {
    return await this.optionGroupRepository.find({
      where: { restaurant_id: restaurant_id },
      relations: { options: true },
    });
  }
  // Create option group
  async addOptionGroup(req: AddOptionGroupRequest, restaurant_id: string) {
    const option_group = await this.optionGroupRepository.save(
      plainToInstance(OptionGroup, { ...req, restaurant_id: restaurant_id }),
    );

    if (req.options?.length > 0) {
      const options = plainToInstance(Option, req.options);

      await this.optionRepository.save(
        options.map((option) => ({
          ...option,
          option_group_id: option_group.id,
        })),
      );
    }
    return option_group;
  }

  //edit option group
  async editOptionGroup(req: UpdateOptionGroupRequest, restaurant_id: string) {
    const option_group = await this.optionGroupRepository.findOne({
      where: { id: req.id, restaurant_id: restaurant_id },
    });
    if (!option_group) throw new NotFoundException('no option group found');
    option_group.name_ar = req.name_ar;
    option_group.name_en = req.name_en;
    option_group.min_selection = req.min_selection;
    option_group.max_selection = req.max_selection;
    return await this.optionGroupRepository.save(option_group);
  }

  //delete option group
  async deleteOptionGroup(id: string, restaurant_id: string) {
    const option_group = await this.optionGroupRepository.findOne({
      where: { id: id, restaurant_id: restaurant_id },
    });
    if (!option_group) throw new NotFoundException('no option group found');
    await this.mealOptionGroupRepository.softDelete({ option_group_id: id });
    return await this.optionGroupRepository.softRemove(option_group);
  }

  //edit option
  async editOption(req: UpdateOptionRequest, restaurant_id: string) {
    const option = await this.optionRepository.findOne({
      where: { id: req.id, option_group: { restaurant_id: restaurant_id } },
    });
    if (!option) throw new NotFoundException('no option found');
    option.name_ar = req.name_ar;
    option.name_en = req.name_en;
    option.price = req.price;
    option.is_active = req.is_active;
    return await this.optionRepository.save(option);
  }

  //delete option
  async deleteOption(id: string, restaurant_id: string) {
    const option = await this.optionRepository.findOne({
      where: { id: id, option_group: { restaurant_id: restaurant_id } },
    });
    if (!option) throw new NotFoundException('no option found');
    return await this.optionRepository.softRemove(option);
  }

  //add meal option groups
  async addMealOptionGroups(
    req: AddMealOptionGroupsRequest,
    restaurant_id: string,
  ) {
    const meal = await this.mealRepository.findOne({
      where: { id: req.meal_id },
    });
    if (!meal) throw new NotFoundException('no meal found');
    for (let index = 0; index < req.option_groups.length; index++) {
      const option_group = await this.optionGroupRepository.findOne({
        where: {
          id: req.option_groups[index].id,
          restaurant_id: restaurant_id,
        },
      });

      if (!option_group) throw new NotFoundException('no option group found');
      await this.mealOptionGroupRepository.save(
        plainToInstance(MealOptionGroup, {
          meal_id: meal.id,
          option_group_id: option_group.id,
          order_by: req.option_groups[index].order_by,
          is_active: req.option_groups[index].is_active,
        }),
      );
    }
  }

  //add option to option group
  async addOptionToOptionGroup(
    req: CreateOptionRequest,
    restaurant_id: string,
  ) {
    const option_group = await this.optionGroupRepository.findOne({
      where: { id: req.option_group_id, restaurant_id: restaurant_id },
    });
    if (!option_group) throw new NotFoundException('no option group found');
    const option = plainToInstance(Option, req);
    return await this.optionRepository.save(option);
  }
  // get single option group
  async getSingleOptionGroup(id: string, restaurant_id: string) {
    const option_group = await this.optionGroupRepository.findOne({
      where: { id: id, restaurant_id: restaurant_id },
      relations: { options: true },
    });
    if (!option_group) throw new NotFoundException('no option group found');
    return option_group;
  }

  async deleteMealOptionGroup(id: string, restaurant_id: string) {
    const option_group = await this.mealOptionGroupRepository.findOne({
      where: {
        id: id,
        meal: { restaurant_category: { restaurant_id: restaurant_id } },
      },
    });
    if (!option_group) throw new NotFoundException('no option group found');
    return await this.mealOptionGroupRepository.softRemove(option_group);
  }

  async updateRestaurant(req: UpdateRestaurantRequest, restaurant_id: string) {
    const restaurant = await this.restaurantRepository.findOne({
      where: { id: restaurant_id },
    });

    if (!restaurant) throw new NotFoundException('no restaurant found');
    restaurant.name_ar = req.name_ar;
    restaurant.name_en = req.name_en;
    restaurant.address_ar = req.address_ar;
    restaurant.address_en = req.address_en;
    restaurant.latitude = Number(req.latitude);
    restaurant.longitude = Number(req.longitude);
  
    restaurant.city_id = req.city_id;
    restaurant.min_order_price = req.min_order_price;
    if (req.logo) {
      //delete old image
      if (restaurant.logo && fs.existsSync(restaurant.logo))
        fs.unlinkSync(restaurant.logo);
      //check if directory exist
      if (!fs.existsSync('storage/restaurant-logos/'))
        fs.mkdirSync('storage/restaurant-logos/');
      if (fs.existsSync(req.logo))
        fs.renameSync(
          req.logo,
          req.logo.replace('/tmp/', '/restaurant-logos/'),
        );
      restaurant.logo = req.logo.replace('/tmp/', '/restaurant-logos/');
    }
    if (req.image) {
      //delete old image
      if (restaurant.image && fs.existsSync(restaurant.image))
        fs.unlinkSync(restaurant.image);
      //check if directory exist
      if (!fs.existsSync('storage/restaurant-images/'))
        fs.mkdirSync('storage/restaurant-images/');
      if (fs.existsSync(req.image))
        fs.renameSync(
          req.image,
          req.image.replace('/tmp/', '/restaurant-images/'),
        );
      restaurant.image = req.image.replace('/tmp/', '/restaurant-images/');
    }
    if (req.cuisines_types_ids) {
      const cuisine_types = await this.cuisineTypeRepository.find({
        where: { id: In(req.cuisines_types_ids) },
      });
      if (!cuisine_types)
        throw new BadRequestException('cuisine types not found');
      restaurant.cuisine_types = cuisine_types;
    }

    await this.restaurantRepository.save(restaurant);
    const respone = await this.getSingleRestaurant(restaurant.id);

    return respone;
  }

  async makeOffer(req: MakeMealOfferRequest, restaurant_id: string) {
    const restaurant = await this.restaurantRepository.findOne({
      where: { id: restaurant_id },
    });
    if (!restaurant) throw new NotFoundException('no restaurant found');
    const meal = await this.mealRepository.findOne({
      where: {
        id: req.meal_id,
        restaurant_category: { restaurant_id: restaurant_id },
      },
    });
    if (!meal) throw new NotFoundException('no meal found');
    const offer = plainToInstance(MealOffer, req);

    return await this.mealOfferRepository.save(offer);
  }

  async getMealsOffers(restaurant_id: string) {
    const meals = await this.mealRepository
      .createQueryBuilder('meal')
      .leftJoinAndSelect('meal.restaurant_category', 'category')
      .leftJoinAndSelect('meal.meal_option_groups', 'meal_option_group')
      .leftJoinAndSelect('meal_option_group.option_group', 'option_group')
      .leftJoinAndSelect('option_group.options', 'options')
      .leftJoinAndSelect('meal.offer', 'offer') // Assuming a relation exists: meal.offers
      .where('category.restaurant_id = :restaurant_id', { restaurant_id })
      .andWhere('offer.start_date <= DATE_ADD(NOW(), INTERVAL 3 HOUR)') // Yemen Time (UTC+3)
      .andWhere('offer.end_date > DATE_ADD(NOW(), INTERVAL 3 HOUR)') // Yemen Time (UTC+3)
      .andWhere('offer.is_active = :is_active', { is_active: true })
      .andWhere('meal.is_active = :is_active', { is_active: true })
      .andWhere('category.is_active = :is_active', { is_active: true })
      .orderBy('offer.order_by', 'ASC')
      .addOrderBy('meal_option_group.order_by', 'ASC')
      .getMany();

    return meals;
  }
  async getAdminMealsOffers(restaurant_id: string) {
    const meals = await this.mealOfferRepository
      .createQueryBuilder('offer')
      .leftJoinAndSelect('offer.meal', 'meal')
      .leftJoinAndSelect('meal.restaurant_category', 'category')
      .leftJoinAndSelect('meal.meal_option_groups', 'meal_option_group')
      .leftJoinAndSelect('meal_option_group.option_group', 'option_group')
      .leftJoinAndSelect('option_group.options', 'options')
      .where('category.restaurant_id = :restaurant_id', { restaurant_id })
      .orderBy('offer.order_by', 'ASC')
      .orderBy('meal_option_group.order_by', 'ASC')
      .getMany();

    return meals;
  }
  async editMealOffer(req: UpdateMealOfferRequest, restaurant_id: string) {
    const offer = await this.mealOfferRepository.findOne({
      where: { id: req.id },
    });
    if (!offer) throw new NotFoundException('no offer found');
    const meal = await this.mealRepository.findOne({
      where: {
        id: offer.meal_id,
        restaurant_category: { restaurant_id: restaurant_id },
      },
    });
    if (!meal) throw new NotFoundException('no meal found');
    const offerUpdate = plainToInstance(MealOffer, req);

    return await this.mealOfferRepository.save(offerUpdate);
  }

  async addFavoriteMeal(meal_id: string) {
    const meal = await this.mealRepository.findOne({
      where: { id: meal_id },
    });
    if (!meal) throw new NotFoundException('no meal found');
    //check if meal is already favorite
    let favorite_meal = await this.clientFavoriteMealRepository.findOne({
      where: { meal_id: meal.id, user_id: this.request.user.id },
    });
    if (favorite_meal)
      //if meal is already favorite remove it
      return await this.clientFavoriteMealRepository.remove(favorite_meal);
    else {
      favorite_meal = plainToInstance(ClientFavoriteMeal, {
        meal_id: meal.id,
        user_id: this.request.user.id,
      });
      return await this.clientFavoriteMealRepository.save(favorite_meal);
    }
  }

  async getFavoriteMeals() {
    const favoriteMeals = await this.clientFavoriteMealRepository.find({
      where: { user_id: this.request.user.id },
      relations: { meal: { restaurant_category: { restaurant: true },offer: true } },
    });

    // Group meals by restaurant
    const groupedByRestaurant = favoriteMeals.reduce((acc, favMeal) => {
      const restaurant = favMeal.meal.restaurant_category.restaurant;
      const restaurantId = restaurant.id;

      if (!acc[restaurantId]) {
        acc[restaurantId] = {
          ...restaurant,
          meals: [],
        };
      }

      acc[restaurantId].meals.push(favMeal.meal);

      return acc;
    }, {});

    // Convert to an array
    const response = Object.values(groupedByRestaurant);

    return plainToInstance(RestaurantResponse, response, {
      excludeExtraneousValues: true,
    });
  }

  async addRestaurantSchedule(
    req: addRestaurantSchedule,
    restaurant_id: string,
  ) {
    const restaurant = await this.restaurantRepository.findOne({
      where: { id: restaurant_id },
    });
    if (!restaurant) throw new NotFoundException('no restaurant found');
    const schedule = plainToInstance(RestaurantSchedule, {
      ...req,
      restaurant_id: restaurant.id,
    });
    return await this.restaurantScheduleRepository.save(schedule);
  }
  async editRestaurantSchedule(
    req: updateRestaurantScheduleRequest,
    restaurant_id: string,
  ) {
    const schedule = await this.restaurantScheduleRepository.findOne({
      where: { id: req.id },
    });
    if (!schedule) throw new NotFoundException('no schedule found');
    const scheduleUpdate = plainToInstance(RestaurantSchedule, req);
    return await this.restaurantScheduleRepository.save(scheduleUpdate);
  }
  async deleteRestaurantSchedule(id: string, restaurant_id: string) {
    const schedule = await this.restaurantScheduleRepository.findOne({
      where: { id: id, restaurant_id: restaurant_id },
    });
    if (!schedule) throw new NotFoundException('no schedule found');
    return await this.restaurantScheduleRepository.remove(schedule);
  }
   IsRestaurantOpen(
    restaurant_id: string,
    schedules?: RestaurantSchedule[],
  ) {
    const now = new Date();

    // Add 3 hours to get Yemen time
    const yemenTime = new Date(now.getTime() + 3 * 60 * 60 * 1000);

    const currentTime = yemenTime.toTimeString().split(' ')[0]; // "HH:MM:SS"
    const dayOfWeek = yemenTime.toLocaleString('en-US', { weekday: 'long' });

  
    //filter schedules by day of week
    schedules = schedules.filter(
      (schedule) => schedule.day_of_week === dayOfWeek,
    );
    const isOpen = schedules.some((schedule) => {
      return (
        currentTime >= schedule.open_time && currentTime <= schedule.close_time
      );
    });

    return isOpen;
  }
}
