import { Exclude, Expose } from 'class-transformer';

import { toUrl } from 'src/core/helpers/file.helper';
import { OrderImage } from 'src/infrastructure/entities/order/order-image.entity';
import { OrderResponse } from './order-response';

@Exclude()
export class OrderDetailsResponse {
  @Expose() id: string;

  order: OrderResponse;

  estimated_biker_arrival_time: Date;

  biker_arrival_time: Date;

  estimated_order_finish_time: Date;

  order_finish_time: Date;

  order_images: OrderImage[];
  constructor(partial: Partial<OrderDetailsResponse>,wash_time?:number) {
    Object.assign(this, partial);
    this.order = new OrderResponse({...partial.order,wash_time:wash_time});

    //* convert path to url
    if (this.order_images) {
      this.order_images = this.order_images.map((image) => {
        if (image.image_url.includes('assets')) {
          image.image_url = toUrl(image.image_url, true);
        } else {
          image.image_url = toUrl(image.image_url);
        }

        return image;
      });
    }
  }
}
