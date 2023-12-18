import { Otp } from '../entities/auth/otp.entity';
import { User } from '../entities/user/user.entity';
import { Address } from '../entities/user/address.entity';
import { Package } from '../entities/package/package.entity';
import { Service } from '../entities/package/service.entity';
import { Order } from '../entities/order/order.entity';
import { Biker } from '../entities/biker/biker.entity';
import { Slot } from '../entities/slot/slot.entity';
import { City } from '../entities/location/city.entity';
import { District } from '../entities/location/district.entity';
import { Region } from '../entities/location/region.entity';
import { EntityChanges } from '../entities/entity-changes/changes.entity';
import { OrderImage } from '../entities/order/order-image.entity';
import { Vehicle } from '../entities/vehicle/vehicle.entity';
import { VehicleBrand } from '../entities/vehicle/vehicle-brand.entity';
import { VehicleBrandModel } from '../entities/vehicle/vehicle-brand-model.entity';
import { VehicleImage } from '../entities/vehicle/vehicle-image.entity';
import { Points } from '../entities/points/point.entity';
import { Customer } from '../entities/customer/customer.entity';
import { Permissions } from '../entities/roles/premissions.entity';
import { Role } from '../entities/roles/role.entity';
import { PromoCode } from '../entities/promo-code/promo-code.entity';
import { Gift } from '../entities/gift/gift.entity';
import { AboutUs } from '../entities/about-us/about-us.entity';
import { SocialMedia } from '../entities/social-media/social-media.entity';
import { Subscription } from '../entities/subscription/subscription.entity';
import { PackagesServices } from '../entities/package/packages-services';
import { Color } from '../entities/color/color.entity';
import { TermsConditions } from '../entities/terms-conditions/terms-conditions.entity';
import { PrivacyPolicy } from '../entities/privacy-policy/privacy-policy.entity';
import { QuestionAndAnswer } from '../entities/question-answer/question-answer.entity';
import { Support } from '../entities/support/support.entity';
import { Banner } from '../entities/banner/banner';
import { SubscriptionPackageService } from '../entities/subscription/subscription-service.entity';
import { OrderDetails } from '../entities/order/order-details';
import { OrderServices } from '../entities/order/order-services';
import { OrderInvoice } from '../entities/order/order-invoice.entity';
import { NotificationEntity } from '../entities/notification/notification.entity';
import { Variable } from '../entities/variable/variable.entity';
import { CancelReasons } from '../entities/order-cancel/cancel-reasons.entity';
import { ReportAbuse } from '../entities/order-cancel/report_abuse.entity';
import { AppConstants } from '../entities/app-constants/app-constants.entity';
import { ReviewOrder } from '../entities/review-order/review-order.entity';
import { WorkingArea } from '../entities/user/wokring-area.entity';

export const DB_ENTITIES = [
  User,
  Address,
  Otp,
  Vehicle,
  VehicleBrand,
  VehicleBrandModel,
  VehicleImage,
  Permissions,
  Points,
  Customer,
  Role,
  Package,
  Service,
  Order,
  Biker,
  Slot,
  City,
  District,
  Region,
  EntityChanges,
  OrderImage,
  PromoCode,
  Gift,
  AboutUs,
  SocialMedia,
  Subscription,
  SubscriptionPackageService,
  PackagesServices,
  Color,
  TermsConditions,
  PrivacyPolicy,
  QuestionAndAnswer,
  Support,
  Banner,
  OrderDetails,
  OrderServices,
  OrderInvoice,
  Variable,
  NotificationEntity,
  CancelReasons,
  ReportAbuse,
  AppConstants,
  ReviewOrder,
  WorkingArea
];

export const DB_VIEWS = [];
