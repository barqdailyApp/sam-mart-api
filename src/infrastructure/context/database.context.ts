import { Otp } from '../entities/auth/otp.entity';
import { User } from '../entities/user/user.entity';
import { Address } from '../entities/user/address.entity';
import { Country } from '../entities/country/country.entity';
import { City } from '../entities/city/city.entity';
import { WorkingArea } from '../entities/working-area/working-area.entity';
import { Driver } from '../entities/driver/driver.entity';
import { Region } from '../entities/region/region.entity';
import { MeasurementUnit } from '../entities/product/measurement-unit.entity';
import { ProductImage } from '../entities/product/product-image.entity';
import { ProductMeasurement } from '../entities/product/product-measurement.entity';
import { Product } from '../entities/product/product.entity';
import { AdditionalService } from '../entities/product/additional-service.entity';
import { Category } from '../entities/category/category.entity';
import { Subcategory } from '../entities/category/subcategory.entity';
import { Section } from '../entities/section/section.entity';
import { SectionCategory } from '../entities/section/section-category.entity';
import { CategorySubCategory } from '../entities/category/category-subcategory.entity';
import { ProductCategoryPrice } from '../entities/product/product-category-price.entity';
import { ProductAdditionalService } from '../entities/product/product-additional-service.entity';
import { ProductCategoryPriceModule } from 'src/modules/product-category-price/product-category-price.module';
import { ProductSubCategory } from '../entities/product/product-sub-category.entity';
import { Banar } from '../entities/banar/banar.entity';
import { MostHitSubcategory } from '../entities/category/most-hit-subcategory.entity';
import { WarehouseProducts } from '../entities/warehouse/warehouse-products.entity';
import { WarehouseOperations } from '../entities/warehouse/warehouse-opreations.entity';
import { Warehouse } from '../entities/warehouse/warehouse.entity';
import { ProductOffer } from '../entities/product/product-offer.entity';
import { SupportTicket } from '../entities/support-ticket/support-ticket.entity';
import { TicketAttachment } from '../entities/support-ticket/ticket-attachement.entity';
import { TicketComment } from '../entities/support-ticket/ticket-comment.entity';
import { StaticPage } from '../entities/static-pages/static-pages.entity';
import { Cart } from '../entities/cart/cart.entity';
import { CartProduct } from '../entities/cart/cart-products';
import { Order } from '../entities/order/order.entity';
import { Slot } from '../entities/order/slot.entity';
import { Shipment } from '../entities/order/shipment.entity';
import { ShipmentProduct } from '../entities/order/shipment-product.entity';
import { ProductFavorite } from '../entities/product/product-favorite.entity';
import { Employee } from '../entities/employee/employee.entity';
import { ShipmentChat } from '../entities/order/shipment-chat.entity';
import { ShipmentChatAttachment } from '../entities/order/shipment-chat-attachment.entity';
import { ShipmentFeedback } from '../entities/order/shipment-feedback.entity';
import { Wallet } from '../entities/wallet/wallet.entity';
import { Transaction as WalletTransaction } from '../entities/wallet/transaction.entity';
import { WarehouseOpreationProducts } from '../entities/warehouse/wahouse-opreation-products.entity';
import { SupportTicketSubject } from '../entities/support-ticket/suppot-ticket-subject.entity';
import { ReturnOrderProduct } from '../entities/order/return-order/return-order-product.entity';
import { ReturnProductReason } from '../entities/order/return-order/return-product-reason.entity';
import { ReturnOrder } from '../entities/order/return-order/return-order.entity';
import { NotificationEntity } from '../entities/notification/notification.entity';
import { Constant } from '../entities/constant/constant.entity';
import { PaymentMethod } from '../entities/payment_method/payment_method.entity';
import { Reason } from '../entities/reason/reason.entity';
import { PromoCode } from '../entities/promo-code/promo-code.entity';
import { SamModules } from '../entities/sam-modules/sam-modules.entity';
import { SamModulesEndpoints } from '../entities/sam-modules/sam-modules-endpoints.entity';
import { UsersSamModules } from '../entities/sam-modules/users-sam-modules.entity';
import { Brand } from '../entities/brand/brand';
import { ShipmentProductHistory } from '../entities/order/shipment-product-history.entity';
import { OrderHistory } from '../entities/order/order-history.entity';
import { ProductChanges } from '../entities/product/product-changes.entity';
import { Restaurant } from '../entities/restaurant/restaurant.entity';
import { CuisineType } from '../entities/restaurant/cuisine-type.entity';
import { Res } from '@nestjs/common';
import { RestaurantCategory } from '../entities/restaurant/restaurant-category.entity';
import { Meal } from '../entities/restaurant/meal/meal.entity';
import { OptionGroup } from '../entities/restaurant/option/option-group.entity';
import { Option } from '../entities/restaurant/option/option.entity';
import { MealOptionGroup } from '../entities/restaurant/meal/meal-option-group';

import { RestaurantAttachment } from '../entities/restaurant/restaurant-attachment.entity';
import { RestaurantAdmin } from '../entities/restaurant/restaurant-admin.entity';
import { RestaurantCartMeal } from '../entities/restaurant/cart/restaurant-cart-meal.entity';
import { RestaurantCart } from '../entities/restaurant/cart/restaurant-cart.entity';
import { RestaurantCartMealOption } from '../entities/restaurant/cart/restaurant-cart-meal-option.entity';
import { RestaurantOrder } from '../entities/restaurant/order/restaurant_order.entity';
import { RestaurantOrderMeal } from '../entities/restaurant/order/restaurant_order_meal.entity';
import { FoodBanar } from '../entities/restaurant/banar/food_banar.entity';
import { RestaurantOrderMealOption } from '../entities/restaurant/order/restaurant_order_meal_option.entity';
export const DB_ENTITIES = [
  User,
  Address,
  Otp,
  Country,
  City,
  WorkingArea,
  Driver,
  Region,
  Product,
  MeasurementUnit,
  ProductMeasurement,
  ProductImage,
  AdditionalService,
  Category,
  Subcategory,
  Section,
  SectionCategory,
  CategorySubCategory,
  ProductCategoryPrice,
  ProductAdditionalService,
  ProductCategoryPriceModule,
  ProductSubCategory,
  Banar,
  MostHitSubcategory,
  WarehouseProducts,
  WarehouseOperations,
  Warehouse,
  ProductOffer,
  Cart,
  CartProduct,
  SupportTicket,
  TicketAttachment,
  TicketComment,
  SupportTicketSubject,
  StaticPage,
  Order,
  Slot,
  Shipment,
  ShipmentProduct,
  ProductFavorite,
  Employee,
  ShipmentChat,
  ShipmentChatAttachment,
  ShipmentFeedback,
  WorkingArea,
  Wallet,
  WalletTransaction,
  WarehouseOpreationProducts,
  ReturnOrderProduct,
  ReturnProductReason,
  ReturnOrder,
  NotificationEntity,
  Constant,
  PaymentMethod,
  Reason,
  PromoCode,
  SamModules,
  SamModulesEndpoints,
  UsersSamModules,
  Brand,
  ShipmentProductHistory,
  OrderHistory,
  ProductChanges,
  Restaurant,
  CuisineType,
  RestaurantCategory,
  Meal,
  Option,
  OptionGroup,
  MealOptionGroup,
  FoodBanar,
  RestaurantAttachment,
  RestaurantAdmin,
  RestaurantCart,
  RestaurantCartMeal,
  RestaurantCartMealOption,
  RestaurantOrder,
  RestaurantOrderMeal,
  RestaurantOrderMealOption,
];

export const DB_VIEWS = [];
