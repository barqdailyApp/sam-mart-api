import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ShipmentsTotalDriverResponse {
  @Expose() ordersNew: number;
  @Expose() ordersActive: number;
  @Expose() ordersDelivered: number;

  constructor(
    ordersNew: number,
    ordersActive: number,
    ordersDelivered: number,
  ) {
    this.ordersNew = ordersNew;
    this.ordersActive = ordersActive;

    this.ordersDelivered = ordersDelivered;
  }
}
