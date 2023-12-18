import { VehicleController } from './controllers/vehicle.controller';
import { Module } from '@nestjs/common';
import { VehicleBrandService } from './services/vehicle-brand.service';
import { VehicleBrandController } from './controllers/vehicle-brand.controller';
import { VehicleBrandModelController } from './controllers/vehicle-brand-model.controller';
import { VehicleBrandModelService } from './services/vehicle-brand-model.service';
import { CreateVehicleTransaction } from './utils/transactions/create-vehicle.transaction';
import { VehicleImageService } from './services/vehicle-image-service';
import { UpdateVehicleTransaction } from './utils/transactions/update-vehicle.transaction';
import { VehicleService } from './services/vehicle.service';
import { ColorModule } from '../color/color.module';
import { DeleteVehicleTransaction } from './utils/transactions/delete-vehicle.transaction';

// import { DeleteVehicleTransaction } from './utils/transactions/delete-vehicle.transaction';

@Module({
  controllers: [
    VehicleController,
    VehicleBrandController,
    VehicleBrandModelController,
  ],
  providers: [
    VehicleService,
    VehicleImageService,
    VehicleBrandService,
    VehicleBrandModelService,
    CreateVehicleTransaction,
    UpdateVehicleTransaction,
    DeleteVehicleTransaction,
  ],
  imports:[ColorModule]
})
export class VehicleModule { }
