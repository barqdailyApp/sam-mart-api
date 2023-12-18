import { toUrl } from 'src/core/helpers/file.helper';
import { Color } from 'src/infrastructure/entities/color/color.entity';
import { VehicleBrandModel } from 'src/infrastructure/entities/vehicle/vehicle-brand-model.entity';
import { VehicleBrand } from 'src/infrastructure/entities/vehicle/vehicle-brand.entity';
import { VehicleImage } from 'src/infrastructure/entities/vehicle/vehicle-image.entity';
import { Vehicle } from 'src/infrastructure/entities/vehicle/vehicle.entity';

export class VehicleResponse {
  id: string;
  brand: VehicleBrandResponse;

  brand_model: VehicleBrandModelResponse;
  color: Color;
  plate: string;
  images: VehicleImageResponse[];

  constructor(partial: Partial<VehicleResponse>) {
    Object.assign(this, partial);
    if (partial.brand_model) {
      this.brand_model = new VehicleBrandModelResponse({
        id: partial.brand_model.id,
        name_ar: partial.brand_model.name_ar,
        name_en: partial.brand_model.name_en,
      });
    }
    if (partial.brand) {
      this.brand = new VehicleBrandResponse({
        id: partial.brand.id,
        name_ar: partial.brand.name_ar,
        name_en: partial.brand.name_en,
        logo: partial.brand.logo,
      });
    }
  }
}

export class VehicleImageResponse {
  id: string;
  image: string;

  constructor(partial: Partial<VehicleImage>) {
    this.id = partial.id;
    this.image = toUrl(partial.image);
  }
}

export class VehicleBrandResponse {
  id: string;
  name_ar: string;
  name_en: string;
  logo: string;

  constructor(partial: Partial<VehicleBrandResponse>) {
    Object.assign(this, partial);
    //* convert path to url
    if (this.logo) {
      if (this.logo.includes('assets')) {
        this.logo = toUrl(this.logo, true);
      } else {
        this.logo = toUrl(this.logo);
      }
    }
  }
}

export class VehicleBrandModelResponse {
  id: string;
  name_ar: string;
  name_en: string;

  constructor(partial: Partial<VehicleBrandModelResponse>) {
    Object.assign(this, partial);
  }
}
