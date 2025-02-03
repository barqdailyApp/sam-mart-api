import { Inject, Injectable, NotFoundException, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/core/base/service/service.base';
import { Restaurant } from 'src/infrastructure/entities/restaurant/restaurant.entity';
import { Repository } from 'typeorm';
import { GetNearResturantsQuery } from './dto/requests/get-near-resturants.query';
import { plainToInstance } from 'class-transformer';
import { RestaurantResponse } from './dto/responses/restaurant.response';
import { CuisineResponse } from './dto/responses/cuisine.response';
import { Meal } from 'src/infrastructure/entities/restaurant/meal/meal.entity';
import { json } from 'sequelize';
import { RestaurantStatus } from 'src/infrastructure/data/enums/restaurant-status.enum';
import { RegisterRestaurantRequest } from './dto/requests/register-restaurant.request';
import { RegisterRestaurantTransaction } from './util/register-restaurant.transaction';
import { CuisineType } from 'src/infrastructure/entities/restaurant/cuisine-type.entity';
import { AddRestaurantCategoryRequest, UpdateRestaurantCategoryRequest } from './dto/requests/add-restaurant-category.request';
import { RestaurantCategory } from 'src/infrastructure/entities/restaurant/restaurant-category.entity';
import { AddMealRequest, UpdateMealRequest } from './dto/requests/add-meal.request';
import * as fs from 'fs';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { RestaurantCartMeal } from 'src/infrastructure/entities/restaurant/cart/restaurant-cart-meal.entity';
import { MealResponse } from './dto/responses/meal.response';
import { AddCuisineRequest } from './dto/requests/add-cuisine.request';

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

  async getTopSellerMeals(query: GetNearResturantsQuery) {
    const { latitude, longitude, radius } = query;

    const meals = await this.mealRepository
      .createQueryBuilder('meal')
      .leftJoinAndSelect('meal.restaurant_category', 'category')
      .leftJoinAndSelect('category.restaurant', 'restaurant')
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

  async getSingleRestaurant(id: string,user_id?:string) {
    const restaurant = await this._repo.findOne({
      where: { id },
      relations: {
        categories: { meals: {meal_option_groups:{option_group:true}} , },
        cuisine_types: true,
      },
    });
  
    if (!restaurant) throw new NotFoundException('no resturant found');
    const response = plainToInstance(RestaurantResponse, restaurant, {
      excludeExtraneousValues: true,
    })
    response.categories.forEach((category) => {
      category.meals.forEach((meal) => {
        meal.direct_add=true
        //if option group min_selection >0
        if(meal.option_groups?.length>0){
          meal.direct_add=false
        }
        
      });
    })
    let cart_details=null
    if(user_id){
      const cart_meals = await this.cartMealRepository.find({
        where: {cart:{user_id:user_id},},relations:{meal:true,cart_meal_options:{option:true}}
      });

    const  total_price= cart_meals.reduce((acc,curr)=>acc+(curr.quantity*curr.meal.price+curr.cart_meal_options.reduce((acc,curr)=>acc+curr.option.price,0)),0)
    const meals_count=cart_meals?.length
      cart_details={meals_count,total_price}
    }    
    return {restaurant:response,cart:cart_details};
  }

  async getAdminSingleRestaurant(id: string) {
    const restaurant = await this._repo.findOne({
      where: { id },
      relations: {
        categories: { meals: {meal_option_groups:{option_group:true}} , },
        cuisine_types: true,
        admins: true,
        attachments: true
      },
    });
    return restaurant;
      
  }

  async getSingleMeal(id: string) {
    const meal = await this.mealRepository.findOne({
      where: { id },
      relations: { meal_option_groups: { option_group: { options: true } , } },
    });
    if (!meal) throw new NotFoundException('no meal found');
    const meal_response= plainToInstance(MealResponse, meal, { excludeExtraneousValues: true });
 

    return meal_response;
  }

  async register(req: RegisterRestaurantRequest) { 
    const restaurant = await this.registerRestaurantTransaction.run(req);
    return restaurant;
  }

  async acceptRestaurant(id: string) {
    const restaurant = await this._repo.findOne({ where: { id ,status: RestaurantStatus.PENDING} });
    if (!restaurant) throw new NotFoundException('no resturant found');
    restaurant.status = RestaurantStatus.ACTIVE;
    return await this._repo.save(restaurant);
  }

  async getCuisineTypes() {
    return await this.cuisineTypeRepository.find({where:{is_active:true},order:{order_by:"ASC"}});
  }

  async addRestaurantCategory(req:AddRestaurantCategoryRequest,restaurant_id:string) {
    const restaurant_category =plainToInstance(RestaurantCategory,{...req,restaurant_id:restaurant_id});
    return await this.restaurantCategoryRepository.save(restaurant_category); 
  }

  async editRestaurantCategory(req:UpdateRestaurantCategoryRequest,restaurant_id:string) {
    const restaurant_category = await this.restaurantCategoryRepository.findOne({where:{id:req.id,restaurant_id:restaurant_id}});
    if(!restaurant_category) throw new NotFoundException('no category found');
    restaurant_category.name_ar=req.name_ar;
    restaurant_category.name_en=req.name_en;
    restaurant_category.order_by=req.order_by;
    restaurant_category.is_active=req.is_active;
    return await this.restaurantCategoryRepository.save(restaurant_category); 
  }
  async deleteCategory(id:string,restaurant_id:string) {
    const category = await this.restaurantCategoryRepository.findOne({where:{id:id,restaurant_id:restaurant_id}});
    if(!category) throw new NotFoundException('no category found');
    return await this.restaurantCategoryRepository.softRemove(category);
  }

  async addMeal(req:AddMealRequest,restaurant_id:string) {
    const meal = plainToInstance(Meal,{...req,restaurant_id:restaurant_id});
    //check if directory exist
    if(!fs.existsSync('storage/restaurant-meals/')) fs.mkdirSync('storage/restaurant-meals/');
    if(fs.existsSync(req.image)) fs.renameSync(req.image, req.image.replace('/tmp/', '/restaurant-meals/'));
    meal.image= req.image.replace('/tmp/', '/restaurant-meals/');
    return await this.mealRepository.save(meal);
  }

  async addCuisine(req:AddCuisineRequest) {
    const cuisine = plainToInstance(CuisineType,{...req});
    //check if directory exist
    if(!fs.existsSync('storage/cuisine-types/')) fs.mkdirSync('storage/cuisine-types/');
    if(fs.existsSync(req.logo)) fs.renameSync(req.logo, req.logo.replace('/tmp/', 'storage/cuisine-types/'));
    cuisine.logo= req.logo.replace('/tmp/', '/cuisine-types/');
    return await this.cuisineTypeRepository.save(cuisine);
  }

  async getRestaurantCategories(restaurant_id:string) {
    return await this.restaurantCategoryRepository.find({where:{restaurant_id:restaurant_id}});
  }

  async getRestaurantCategoryMeals(restaurant_id:string,category_id:string) {
    return await this.restaurantCategoryRepository.findOne({where:{restaurant_id:restaurant_id,id:category_id},relations:{meals:true}});
  }
  // edit meal

  async editMeal(req:UpdateMealRequest,restaurant_id:string) {
    const meal = await this.mealRepository.findOne({where:{id:req.id,restaurant_category:{restaurant_id:restaurant_id}}});
    if(!meal) throw new NotFoundException('no meal found');
    if(req.image) {
      //delete old image
      if(meal.image && fs.existsSync(meal.image)) fs.unlinkSync(meal.image);
      //check if directory exist
      if(fs.existsSync(req.image)) fs.renameSync(req.image, req.image.replace('/tmp/', '/restaurant-meals/'));
      meal.image= req.image.replace('/tmp/', '/restaurant-meals/');
    }
    meal.name_ar=req.name_ar;
    meal.name_en=req.name_en;
    meal.description_ar=req.description_ar;
    meal.description_en=req.description_en;
    meal.price=req.price;
  
   
    return await this.mealRepository.save(meal);
  }

  // delete meal
  async deleteMeal(id:string,restaurant_id:string) {
    const meal = await this.mealRepository.findOne({where:{id:id,restaurant_category:{restaurant_id:restaurant_id}}});
    if(!meal) throw new NotFoundException('no meal found');
    return await this.mealRepository.softRemove(meal);
  }
}
